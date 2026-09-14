import pandas as pd
import numpy as np
import joblib
import shap
import matplotlib.pyplot as plt

def generate_shap_explanations():
    print("1. Loading Model, Encoder, and Feature List...")
    model = joblib.load('vayudrishty_xgb_model.pkl')
    features = joblib.load('vayudrishty_feature_names.pkl')
    le = joblib.load('vayudrishty_label_encoder.pkl')
    
    print("2. Loading Test Data and Sampling...")
    test_df = pd.read_pickle('vayudrishty_test.pkl').reset_index(drop=True)
    
    # Re-inject cyclic features to match training inputs
    test_df['month_sin'] = np.sin(2 * np.pi * test_df['timestamp'].dt.month / 12.0)
    test_df['month_cos'] = np.cos(2 * np.pi * test_df['timestamp'].dt.month / 12.0)
    test_df['hour_sin'] = np.sin(2 * np.pi * test_df['timestamp'].dt.hour / 24.0)
    test_df['hour_cos'] = np.cos(2 * np.pi * test_df['timestamp'].dt.hour / 24.0)
    
    X_test = test_df[features]
    
    # Take a representative 5,000-row sample for fast SHAP calculation
    X_sample = X_test.sample(n=5000, random_state=42)
    
    print("3. Initializing SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(model)
    
    print("4. Calculating SHAP values (this may take a minute)...")
    shap_values = explainer.shap_values(X_sample)
    
    print("5. Generating Global Feature Importance Plot...")
    class_names = le.classes_.tolist()
    
    plt.figure(figsize=(12, 8))
    shap.summary_plot(
        shap_values, 
        X_sample, 
        plot_type="bar", 
        class_names=class_names,
        show=False
    )
    
    plt.title("Vayudrishty: Global Feature Importance by Anomaly Type", fontsize=14, pad=20)
    plt.tight_layout()
    plt.savefig('vayudrishty_shap_summary.png', dpi=300, bbox_inches='tight')
    print("Success! SHAP summary plot saved as 'vayudrishty_shap_summary.png'")

if __name__ == "__main__":
    generate_shap_explanations()