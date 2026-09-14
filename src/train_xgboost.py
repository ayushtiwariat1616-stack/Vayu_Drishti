import pandas as pd
import numpy as np
import optuna
import joblib
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, f1_score
from sklearn.preprocessing import LabelEncoder

def add_cyclic_features(df):
    """Encodes Month and Hour as cyclic variables."""
    df['month_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.month / 12.0)
    df['month_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.month / 12.0)
    df['hour_sin'] = np.sin(2 * np.pi * df['timestamp'].dt.hour / 24.0)
    df['hour_cos'] = np.cos(2 * np.pi * df['timestamp'].dt.hour / 24.0)
    return df

def train_and_evaluate_xgb():
    print("1. Loading Train and Test datasets...")
    train_df = pd.read_pickle('vayudrishty_train.pkl').reset_index(drop=True)
    test_df = pd.read_pickle('vayudrishty_test.pkl').reset_index(drop=True)

    print("2. Injecting Seasonal and Daily Cyclic Features...")
    train_df = add_cyclic_features(train_df)
    test_df = add_cyclic_features(test_df)

    exclude_cols = ['station_id', 'station_name', 'timestamp', 'report_type', 
                    'pressure_source', 'anomaly_label']
    features = [c for c in train_df.columns if c not in exclude_cols]

    X_train = train_df[features]
    y_train = train_df['anomaly_label']
    X_test = test_df[features]
    y_test = test_df['anomaly_label']

    print("\n3. Encoding Target Labels for XGBoost...")
    le = LabelEncoder()
    # Ensure encoded array retains the exact same Series index as X_train
    y_train_encoded = pd.Series(le.fit_transform(y_train), index=y_train.index)
    y_test_encoded = pd.Series(le.transform(y_test), index=y_test.index)
    
    joblib.dump(le, 'vayudrishty_label_encoder.pkl')

    print(f"Total features used: {len(features)}")

    print("\n4. Setting up FAST OPTUNA (using 10% sample of training data)...")
    # Sample matching indices perfectly without KeyError
    X_tune = X_train.sample(frac=0.1, random_state=42)
    y_tune = y_train_encoded.loc[X_tune.index]

    def objective(trial):
        params = {
            'n_estimators': trial.suggest_int('n_estimators', 100, 300),
            'max_depth': trial.suggest_int('max_depth', 6, 12),
            'learning_rate': trial.suggest_float('learning_rate', 0.03, 0.2, log=True),
            'subsample': trial.suggest_float('subsample', 0.8, 1.0),
            'tree_method': 'hist',
            'random_state': 42,
            'n_jobs': -1 
        }
        
        clf = XGBClassifier(**params)
        clf.fit(X_tune, y_tune)
        return clf.score(X_tune, y_tune)

    # 10 quick trials on the 10% sample
    study = optuna.create_study(direction='maximize')
    study.optimize(objective, n_trials=10)

    print("\nBest Optuna Hyperparameters:")
    print(study.best_params)

    print("\n5. Training Final XGBoost on FULL 4.4M Training Set...")
    best_params = study.best_params
    best_params['tree_method'] = 'hist'
    best_params['n_jobs'] = -1
    best_params['random_state'] = 42
    
    final_model = XGBClassifier(**best_params)
    final_model.fit(X_train, y_train_encoded)

    print("6. Evaluating Model on Unseen 1.1M Test Set...")
    y_pred_encoded = final_model.predict(X_test)
    
    # Decode back to human-readable strings
    y_pred = le.inverse_transform(y_pred_encoded)
    
    print("\n--- CLASSIFICATION REPORT ---")
    print(classification_report(y_test, y_pred))
    
    print(f"\nMacro F1 Score: {f1_score(y_test, y_pred, average='macro'):.4f}")

    print("\n7. Saving Model and Feature List...")
    joblib.dump(final_model, 'vayudrishty_xgb_model.pkl')
    joblib.dump(features, 'vayudrishty_feature_names.pkl')
    print("Success! Model saved as vayudrishty_xgb_model.pkl")

if __name__ == "__main__":
    train_and_evaluate_xgb()