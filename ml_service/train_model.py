"""
Train and save the ML model for predictive maintenance
Run this script once to train and save the model
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, roc_auc_score
from xgboost import XGBClassifier

# Set paths - CSV is in parent directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, 'ai4i2020 (1).csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODEL_DIR, 'xgb_model.pkl')
SCALER_PATH = os.path.join(MODEL_DIR, 'scaler.pkl')
LABEL_ENCODER_PATH = os.path.join(MODEL_DIR, 'label_encoder.pkl')

print("Loading dataset...")
df = pd.read_csv(CSV_PATH)

print("Preprocessing...")
# Drop unnecessary columns
df = df.drop(['UDI', 'Product ID'], axis=1)

# Encode categorical column
le = LabelEncoder()
df['Type'] = le.fit_transform(df['Type'])

# Add new features
df['temperature_difference'] = df['Process temperature [K]'] - df['Air temperature [K]']
df['Mechanical Power [W]'] = 2 * np.pi * df['Rotational speed [rpm]'] / 60 * df['Torque [Nm]']

# Define Features & Target
X = df.drop(['Machine failure', 'TWF', 'HDF', 'PWF', 'OSF', 'RNF'], axis=1)
y = df['Machine failure']

# Clean column names for XGBoost (remove brackets)
X.columns = X.columns.str.replace('[\[\]<>]', '', regex=True)

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

print("Training XGBoost model...")
# Train XGBoost (best performing model)
# Using scale_pos_weight to handle class imbalance instead of SMOTE
scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()

xgb = XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=scale_pos_weight,
    random_state=42
)

xgb.fit(X_train, y_train)

# Evaluate
y_pred = xgb.predict(X_test)
y_pred_prob = xgb.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_pred_prob)

print(f"\nModel Performance:")
print(f"Accuracy: {accuracy:.3f}")
print(f"AUC: {auc:.3f}")

# Save model and preprocessing objects
print("\nSaving model...")
joblib.dump(xgb, MODEL_PATH)
joblib.dump(le, LABEL_ENCODER_PATH)

# Save feature names for reference
feature_names = X.columns.tolist()
with open(os.path.join(MODEL_DIR, 'feature_names.txt'), 'w') as f:
    f.write('\n'.join(feature_names))

print(f"Model saved to: {MODEL_PATH}")
print(f"Feature names: {len(feature_names)} features")
print("\nTraining complete!")

