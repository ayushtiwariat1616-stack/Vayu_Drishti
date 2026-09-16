# 🌬️ Vayu Drishti

### AI-Powered Intelligent Sensor Health & Anomaly Detection Platform

[![Project](https://img.shields.io/badge/Project-Vayu%20Drishti-1f6feb?style=for-the-badge)](https://github.com/ayushtiwariat1616-stack/Vayu_Drishti)
[![Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Django-092E20?style=for-the-badge\&logo=django\&logoColor=white)](https://www.djangoproject.com/)
[![ML](https://img.shields.io/badge/ML-XGBoost-orange?style=for-the-badge)](https://xgboost.readthedocs.io/)
[![IoT](https://img.shields.io/badge/IoT-ESP32-red?style=for-the-badge)](https://www.espressif.com/en/products/socs/esp32)
[![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?style=for-the-badge\&logo=docker\&logoColor=white)](https://www.docker.com/)

> **Vayu Drishti** is an AI-powered intelligent sensor health platform designed to monitor environmental sensor data, detect anomalous behavior, identify probable root causes, and provide explainable insights for reliable weather-station operations.

### 🔗 Project Links

**GitHub:**
https://github.com/ayushtiwariat1616-stack/Vayu_Drishti

**Live Application:**
https://vayu-drishti-chi.vercel.app/

---

## 📌 Overview

Environmental monitoring systems continuously generate telemetry from distributed weather and atmospheric sensors. However, an abnormal sensor reading does not necessarily represent an abnormal environmental event.

A sudden change may originate from:

* Sensor malfunction
* Sensor drift or bias
* Frozen/stuck measurements
* Missing or corrupted data
* Communication problems
* Noise or transient spikes
* Physically inconsistent measurements
* Genuine environmental changes

**Vayu Drishti** addresses this challenge by combining **IoT telemetry, data processing, machine learning, anomaly detection, and explainable AI** into a unified monitoring platform.

Instead of simply flagging an unusual reading, the system aims to answer:

> **What happened, why did it happen, and what should be checked next?**

---

# 🎯 Problem Statement

Traditional monitoring systems generally rely on threshold-based alerts.

For example:

```text
Temperature > Threshold
        ↓
     ALERT
```

This approach can generate false alarms because a sudden reading may be caused by either:

**A genuine environmental event**

or

**A sensor/system fault.**

Vayu Drishti introduces an intelligent analysis layer:

```text
Sensor Reading
      ↓
Data Validation
      ↓
Anomaly Detection
      ↓
Feature Engineering
      ↓
Root-Cause Classification
      ↓
Explainable AI
      ↓
Actionable Insight
```

---

# 💡 Proposed Solution

Vayu Drishti provides an end-to-end pipeline for intelligent sensor monitoring.

### Core workflow

```text
┌──────────────────────┐
│ Environmental Sensors│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ ESP32 / IoT Gateway  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Data Ingestion       │
│ & Validation         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Feature Engineering  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Anomaly Detection    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Root Cause           │
│ Classification       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Explainable AI       │
│ (SHAP)               │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Web Dashboard        │
└──────────────────────┘
```

---

# 🚀 Key Features

## 1. 📡 Intelligent Sensor Monitoring

The platform is designed to process atmospheric/weather-station telemetry and monitor sensor behavior over time.

Typical measurements include:

* Temperature
* Relative humidity
* Atmospheric pressure
* Timestamp
* Station information
* Data/communication status

---

## 2. 🤖 AI-Based Anomaly Detection

Instead of depending exclusively on static thresholds, the system analyzes temporal and statistical patterns in sensor data.

The objective is to identify unusual behavior while considering the surrounding data context.

---

## 3. 🧠 Root-Cause Classification

Vayu Drishti's Model 2 provides a structured anomaly taxonomy.

| Category              | Description                                         |
| --------------------- | --------------------------------------------------- |
| `NORMAL`              | Data behaves within expected conditions             |
| `COMMUNICATION_ERROR` | Communication or time-gap related issue             |
| `MISSING_DATA`        | Missing or invalid telemetry                        |
| `SPIKE`               | Sudden abnormal increase                            |
| `DROP`                | Sudden abnormal decrease                            |
| `FROZEN_SENSOR`       | Sensor value remains unchanged                      |
| `DRIFT`               | Gradual deviation over time                         |
| `BIAS`                | Persistent measurement offset                       |
| `NOISE`               | Irregular measurement fluctuations                  |
| `MULTIVARIATE_FAULT`  | Inconsistency across multiple atmospheric variables |

This taxonomy is documented in the repository's Model 2 documentation.

---

# 🔬 Machine Learning Pipeline

The ML pipeline combines raw telemetry with engineered temporal, statistical, and physical features.

```text
Raw Sensor Data
       │
       ▼
Data Cleaning
       │
       ▼
Temporal Features
       │
       ▼
Rolling Statistics
       │
       ▼
Sensor Integrity Features
       │
       ▼
Atmospheric Relationship Features
       │
       ▼
ML Classification
       │
       ▼
Anomaly Category
       │
       ▼
Explanation + Recommendation
```

### Feature Engineering

The system can use features such as:

* Rolling mean
* Rolling standard deviation
* Time gaps
* Missing-data indicators
* Temporal/cyclic features
* Dew-point related relationships
* Atmospheric pressure relationships
* Cross-variable consistency

---

# 🧠 Explainable AI

A major component of Vayu Drishti is **Explainable AI (XAI)**.

A machine-learning prediction is more useful when the system can also communicate which factors contributed to the result.

### Example

```text
Detected Anomaly
       ↓
MULTIVARIATE_FAULT
       ↓
High Confidence
       ↓
Important contributing features
       ↓
Human-readable explanation
       ↓
Recommended inspection/action
```

The project uses **SHAP** for model explainability in the Model 2 pipeline.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │   Weather / IoT      │
                         │       Sensors        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      ESP32           │
                         │   Data Acquisition   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Django Backend     │
                         │      / API           │
                         └──────────┬───────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                         ▼                     ▼
                ┌─────────────────┐   ┌─────────────────┐
                │ Data Processing │   │ ML Model        │
                │ & Validation    │   │ & Classification│
                └────────┬────────┘   └────────┬────────┘
                         │                     │
                         └──────────┬──────────┘
                                    ▼
                         ┌──────────────────────┐
                         │   Explainable AI     │
                         │       SHAP           │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Dashboard    │
                         │ Visualization &      │
                         │ Monitoring           │
                         └──────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

* **React**
* **Vite**
* **Tailwind CSS**
* **React Router**
* **Axios**
* **React Query**
* **Recharts**
* **Lucide React**

## Backend

* **Python**
* **Django**
* **Django REST Framework**
* **Django Channels**
* **Daphne**
* **PostgreSQL**
* **Redis**

## Machine Learning

* **Python**
* **Pandas**
* **NumPy**
* **Scikit-learn**
* **XGBoost**
* **Optuna**
* **SHAP**
* **Joblib**

## Hardware / IoT

* **ESP32**
* **BME280**
* **Arduino/C++ firmware**

## Deployment

* **Docker**
* **Docker Compose**
* **Vercel**

The repository currently contains dedicated hardware, frontend, API, model, source, and Django project directories, along with Docker configuration and Python dependencies.

---

# 📂 Project Structure

```text
Vayu_Drishti/
│
├── Hardware/
│   └── ESP32 / sensor firmware
│
├── RandomForest/
│   └── Machine learning components
│
├── api/
│   └── API components
│
├── assets/
│   └── Project assets
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── models/
│   └── Trained ML models
│
├── src/
│   └── Data processing / ML source
│
├── vayudhrishti/
│   └── Django project configuration
│
├── test/
│   └── Testing components
│
├── Dockerfile
├── docker-compose.yml
├── manage.py
├── requirements.txt
├── README_Model2.md
└── README.md
```

The directory structure above corresponds to the current repository layout.

---

# ⚙️ Installation

## Prerequisites

Make sure you have:

* Python 3.x
* Node.js
* npm
* Git
* Docker *(optional)*

---

## 1. Clone the Repository

```bash
git clone https://github.com/ayushtiwariat1616-stack/Vayu_Drishti.git

cd Vayu_Drishti
```

---

# 🐍 Backend Setup

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py migrate
```

Start the backend:

```bash
python manage.py runserver
```

---

# ⚛️ Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

# 🐳 Docker Deployment

The repository includes Docker configuration.

Build and start the application:

```bash
docker compose up --build
```

Stop the containers:

```bash
docker compose down
```

---

# 📊 Dashboard

The web dashboard is designed to provide a centralized view of:

* Sensor measurements
* Sensor status
* Detected anomalies
* Root-cause classifications
* Confidence information
* Model explanations
* Monitoring insights

### Live Application

**https://vayu-drishti-chi.vercel.app/**

The repository currently lists this application as its deployed project link.

---

# 🔄 End-to-End Workflow

```text
01  Sensor Data Collection
          ↓
02  IoT Transmission
          ↓
03  Backend Data Ingestion
          ↓
04  Data Validation
          ↓
05  Feature Engineering
          ↓
06  Anomaly Detection
          ↓
07  Root-Cause Classification
          ↓
08  Explainable AI
          ↓
09  Dashboard Visualization
          ↓
10  Monitoring / Maintenance Action
```

---

# 🎯 Use Cases

### Weather Stations

Monitor the health and reliability of distributed weather-station sensors.

### Environmental Monitoring

Identify abnormal measurements while differentiating possible sensor faults from environmental changes.

### Predictive Maintenance

Detect patterns that may indicate sensor degradation or hardware issues.

### IoT Infrastructure

Monitor data quality and communication-related problems across connected devices.

### Smart Infrastructure

Provide an intelligent monitoring layer for large-scale sensor networks.

---

# 🌟 Why Vayu Drishti?

Vayu Drishti focuses on **sensor intelligence rather than simply displaying sensor readings**.

### Traditional Monitoring

```text
Sensor
  ↓
Reading
  ↓
Threshold
  ↓
Alert
```

### Vayu Drishti

```text
Sensor
  ↓
Telemetry
  ↓
Contextual Analysis
  ↓
Anomaly Detection
  ↓
Root Cause
  ↓
Explanation
  ↓
Recommended Action
```

This makes the system oriented toward **understanding sensor health and data reliability**, rather than treating every unusual measurement as the same type of alert.

---

# 🔮 Future Scope

Future development can include:

* Real-time notification and alerting
* Larger distributed sensor networks
* Automated model retraining
* Advanced predictive maintenance
* Geospatial station monitoring
* Mobile monitoring application
* Historical anomaly analytics
* Cloud-scale deployment
* Additional atmospheric sensors
* Improved model monitoring and drift detection

---

# 🧪 Model Evaluation

Model evaluation should be interpreted according to the dataset, station distribution, temporal split, and deployment environment used for testing.

For production deployment, the model should be continuously evaluated on:

* Unseen stations
* New environmental conditions
* Different sensor hardware
* Changing seasonal patterns
* Sensor calibration changes
* Real-world anomaly cases

This is important because high performance on a particular test dataset does not automatically guarantee equivalent performance in every deployment environment.

---

# 🔐 Security & Configuration

Do not commit secrets, API keys, passwords, or production credentials to GitHub.

Use environment variables for sensitive configuration.

Example:

```text
.env
```

and keep sensitive files excluded through:

```text
.gitignore
```

Before deployment, verify that no credentials or private configuration files are included in the repository.

---

# 🧪 Testing

The repository contains a dedicated `test/` directory for project testing.

Run the relevant tests according to the project's configured testing environment.

For Django projects, a typical command is:

```bash
python manage.py test
```

---

# 🤝 Contributing

Contributions and improvements are welcome.

### Fork the repository

```bash
git clone https://github.com/ayushtiwariat1616-stack/Vayu_Drishti.git
```

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Make your changes and commit:

```bash
git add .
git commit -m "Add: your feature"
```

Push the branch:

```bash
git push origin feature/your-feature
```

Then create a Pull Request on GitHub.

---

# 👥 Team

## Vayu Drishti

**AI + IoT + Machine Learning + Explainable AI**

Developed as an intelligent environmental sensor-health and anomaly-analysis platform.

---

# 📜 License

Refer to the repository for the applicable project license and usage terms.

---

# 📚 Documentation

Detailed Model 2 documentation is available in:

```text
README_Model2.md
```

This document contains additional information about the model pipeline and anomaly-classification implementation.

---

# 🔗 Links

| Resource          | Link                                                    |
| ----------------- | ------------------------------------------------------- |
| GitHub Repository | https://github.com/ayushtiwariat1616-stack/Vayu_Drishti |
| Live Application  | https://vayu-drishti-chi.vercel.app/                    |

---

<div align="center">

## 🌬️ VAYU DRISHTI

### **Detect. Understand. Act.**

**Intelligent Sensor Health for Reliable Environmental Monitoring**

⭐ Star the repository if you find the project useful.

</div>
