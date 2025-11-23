"""
Flask API service for ML predictions
Run: python predict_service.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Load model and preprocessing objects
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'xgb_model.pkl')
LABEL_ENCODER_PATH = os.path.join(MODEL_DIR, 'label_encoder.pkl')

model = None
label_encoder = None
feature_names = None

def load_model():
    global model, label_encoder, feature_names
    if model is None:
        print("Loading model...")
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(LABEL_ENCODER_PATH)
        
        # Load feature names
        with open(os.path.join(MODEL_DIR, 'feature_names.txt'), 'r') as f:
            feature_names = [line.strip() for line in f.readlines()]
        print(f"Model loaded. Features: {len(feature_names)}")
    return model, label_encoder, feature_names

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        machine_id = data.get('machineId', 'unknown')
        telemetry = data.get('telemetry', {})
        
        # Load model if not loaded
        model, le, feature_names = load_model()
        
        # Map telemetry to feature names dynamically based on actual model features
        telemetry_map = {
            'air_temperature': telemetry.get('air_temperature', telemetry.get('Air temperature K', 300)),
            'process_temperature': telemetry.get('process_temperature', telemetry.get('Process temperature K', 310)),
            'rotational_speed': telemetry.get('rotational_speed', telemetry.get('Rotational speed rpm', 1500)),
            'torque': telemetry.get('torque', telemetry.get('Torque Nm', 40)),
            'tool_wear': telemetry.get('tool_wear', telemetry.get('Tool wear min', 0)),
            'type': telemetry.get('type', telemetry.get('Type', 0)),
        }
        
        # Build features dict matching exact feature names from model
        features = {}
        for feat_name in feature_names:
            feat_lower = feat_name.lower().replace(' ', '').replace('[', '').replace(']', '').replace('(', '').replace(')', '')
            
            if 'air' in feat_lower and 'temperature' in feat_lower:
                features[feat_name] = telemetry_map['air_temperature']
            elif 'process' in feat_lower and 'temperature' in feat_lower:
                features[feat_name] = telemetry_map['process_temperature']
            elif 'rotational' in feat_lower or ('speed' in feat_lower and 'rpm' in feat_lower):
                features[feat_name] = telemetry_map['rotational_speed']
            elif 'torque' in feat_lower:
                features[feat_name] = telemetry_map['torque']
            elif 'tool' in feat_lower and 'wear' in feat_lower:
                features[feat_name] = telemetry_map['tool_wear']
            elif feat_lower == 'type':
                features[feat_name] = telemetry_map['type']
            elif 'temperature' in feat_lower and 'difference' in feat_lower:
                features[feat_name] = telemetry_map['process_temperature'] - telemetry_map['air_temperature']
            elif 'mechanical' in feat_lower and 'power' in feat_lower:
                features[feat_name] = 2 * np.pi * telemetry_map['rotational_speed'] / 60 * telemetry_map['torque']
        
        # Ensure all features are present (fill missing with defaults)
        feature_vector = []
        for feat_name in feature_names:
            if feat_name in features:
                feature_vector.append(features[feat_name])
            else:
                # Default values based on feature name
                if 'temperature' in feat_name.lower():
                    feature_vector.append(300 if 'Air' in feat_name else 310)
                elif 'speed' in feat_name.lower():
                    feature_vector.append(1500)
                elif 'torque' in feat_name.lower():
                    feature_vector.append(40)
                elif 'wear' in feat_name.lower():
                    feature_vector.append(0)
                elif 'difference' in feat_name.lower():
                    feature_vector.append(10)
                elif 'power' in feat_name.lower():
                    feature_vector.append(100)
                else:
                    feature_vector.append(0)
        
        # Convert to DataFrame
        X = pd.DataFrame([feature_vector], columns=feature_names)
        
        # Make prediction
        failure_probability = model.predict_proba(X)[0][1]
        failure_prediction = model.predict(X)[0]
        
        # Convert to health score (0-100, where 100 = no failure, 0 = certain failure)
        health_score = (1 - failure_probability) * 100
        
        # Determine risk level
        if health_score >= 75:
            risk = 'low'
        elif health_score >= 50:
            risk = 'medium'
        elif health_score >= 25:
            risk = 'high'
        else:
            risk = 'critical'
        
        # Get feature importance (SHAP-like values)
        # XGBoost feature importance
        feature_importance = model.feature_importances_
        top_features_idx = np.argsort(feature_importance)[::-1][:6]
        
        # Calculate baseline values for comparison
        baseline_values = {
            'air_temp': 300,
            'process_temp': 310,
            'rotational_speed': 1500,
            'torque': 40,
            'tool_wear': 0,
        }
        
        shap_features = []
        for idx in top_features_idx:
            feat_name = feature_names[idx]
            importance = float(feature_importance[idx])
            value = feature_vector[idx]
            
            # Calculate impact (normalize importance to -100 to 100 scale)
            max_importance = feature_importance.max() if feature_importance.max() > 0 else 1
            impact = (importance / max_importance) * 100
            
            # Determine if feature contributes to failure (based on value and importance)
            # Higher tool wear, higher temperature = negative impact
            feat_lower = feat_name.lower()
            if 'wear' in feat_lower:
                # Higher wear = negative impact
                if value > baseline_values.get('tool_wear', 0):
                    impact = -abs(impact)
                else:
                    impact = abs(impact)
            elif 'temperature' in feat_lower:
                # Higher temperature = negative impact
                baseline = baseline_values.get('process_temp' if 'process' in feat_lower else 'air_temp', 300)
                if value > baseline:
                    impact = -abs(impact)
                else:
                    impact = abs(impact)
            elif failure_prediction == 1:  # If failure predicted, negative impact
                impact = -abs(impact)
            else:
                # For other features, positive impact if healthy
                impact = abs(impact)
            
            shap_features.append({
                'feature': feat_name,
                'value': float(value),
                'shapValue': float(importance * 10),  # Scaled for display
                'impact': float(impact)
            })
        
        # Predict specific failure types based on telemetry values
        def predict_failure_types(telemetry_map, feature_vector, feature_names):
            """Predict probability of each failure type based on telemetry"""
            
            # Map feature names to indices
            feat_dict = {name: idx for idx, name in enumerate(feature_names)}
            
            # Get feature values
            tool_wear = feature_vector[feat_dict.get('Tool wear min', 0)] if 'Tool wear min' in feat_dict else telemetry_map.get('tool_wear', 0)
            air_temp = feature_vector[feat_dict.get('Air temperature K', 0)] if 'Air temperature K' in feat_dict else telemetry_map.get('air_temperature', 300)
            process_temp = feature_vector[feat_dict.get('Process temperature K', 0)] if 'Process temperature K' in feat_dict else telemetry_map.get('process_temperature', 310)
            temp_diff = process_temp - air_temp
            rotational_speed = feature_vector[feat_dict.get('Rotational speed rpm', 0)] if 'Rotational speed rpm' in feat_dict else telemetry_map.get('rotational_speed', 1500)
            torque = feature_vector[feat_dict.get('Torque Nm', 0)] if 'Torque Nm' in feat_dict else telemetry_map.get('torque', 40)
            mechanical_power = 2 * np.pi * rotational_speed / 60 * torque
            
            # TWF (Tool Wear Failure) - High tool wear (>200 is critical)
            twf_prob = min(1.0, max(0.0, (tool_wear - 200) / 100)) if tool_wear > 200 else (tool_wear / 200) * 0.5
            
            # HDF (Heat Dissipation Failure) - High temperature difference (>10K is concerning)
            hdf_prob = min(1.0, max(0.0, (temp_diff - 10) / 10)) if temp_diff > 10 else (temp_diff / 10) * 0.3
            
            # PWF (Power Failure) - Low mechanical power or torque issues
            pwf_prob = min(1.0, max(0.0, (40 - torque) / 20)) if torque < 40 else 0.0
            if mechanical_power < 5000:  # Low power also indicates PWF
                pwf_prob = max(pwf_prob, min(1.0, (5000 - mechanical_power) / 3000))
            
            # OSF (Overstrain Failure) - High rotational speed (>1800 rpm is risky)
            osf_prob = min(1.0, max(0.0, (rotational_speed - 1800) / 400)) if rotational_speed > 1800 else (rotational_speed / 1800) * 0.2
            
            # RNF (Random Failure) - Combination of factors
            rnf_prob = min(1.0, (twf_prob * 0.3 + hdf_prob * 0.3 + pwf_prob * 0.2 + osf_prob * 0.2))
            
            return {
                'TWF': round(twf_prob, 3),
                'HDF': round(hdf_prob, 3),
                'PWF': round(pwf_prob, 3),
                'OSF': round(osf_prob, 3),
                'RNF': round(rnf_prob, 3)
            }
        
        # Map features to failure types
        def get_feature_responsibility(feature_name, value, failure_types):
            """Determine which failure type each feature contributes to"""
            feat_lower = feature_name.lower()
            responsibilities = []
            
            if 'wear' in feat_lower:
                responsibilities.append({
                    'failureType': 'TWF',
                    'probability': failure_types['TWF'],
                    'reason': f'Tool wear value ({value:.1f} min) indicates potential tool wear failure'
                })
            
            if 'temperature' in feat_lower:
                if 'difference' in feat_lower or 'process' in feat_lower:
                    responsibilities.append({
                        'failureType': 'HDF',
                        'probability': failure_types['HDF'],
                        'reason': f'Temperature value ({value:.1f}K) suggests heat dissipation issues'
                    })
                elif 'air' in feat_lower:
                    # Air temp alone is less indicative, but can contribute
                    if value > 310:
                        responsibilities.append({
                            'failureType': 'HDF',
                            'probability': failure_types['HDF'] * 0.5,
                            'reason': f'High air temperature ({value:.1f}K) may contribute to heat issues'
                        })
            
            if 'torque' in feat_lower or 'power' in feat_lower:
                responsibilities.append({
                    'failureType': 'PWF',
                    'probability': failure_types['PWF'],
                    'reason': f'Power-related value ({value:.1f}) indicates potential power failure'
                })
            
            if 'speed' in feat_lower or 'rotational' in feat_lower:
                responsibilities.append({
                    'failureType': 'OSF',
                    'probability': failure_types['OSF'],
                    'reason': f'Rotational speed ({value:.1f} rpm) may cause overstrain'
                })
            
            return responsibilities
        
        # Calculate failure types
        failure_types = predict_failure_types(telemetry_map, feature_vector, feature_names)
        
        # Get feature responsibilities for top features
        feature_responsibilities = []
        for idx in top_features_idx[:5]:  # Top 5 features
            feat_name = feature_names[idx]
            value = feature_vector[idx]
            responsibilities = get_feature_responsibility(feat_name, value, failure_types)
            if responsibilities:
                feature_responsibilities.append({
                    'feature': feat_name,
                    'value': float(value),
                    'responsibleFor': responsibilities
                })
        
        # Generate explanation
        explanations = {
            'low': f'Machine {machine_id} shows excellent health indicators. All telemetry parameters are within normal operating ranges. Failure probability: {failure_probability:.1%}',
            'medium': f'Machine {machine_id} shows moderate performance. Some telemetry parameters indicate potential maintenance needs. Failure probability: {failure_probability:.1%}',
            'high': f'Machine {machine_id} shows concerning trends. Multiple telemetry parameters suggest increased failure risk. Failure probability: {failure_probability:.1%}',
            'critical': f'Machine {machine_id} is in critical condition. High failure probability detected: {failure_probability:.1%}. Urgent maintenance required.'
        }
        
        return jsonify({
            'score': round(health_score, 1),
            'risk': risk,
            'probability': {
                'low': float(1 - failure_probability) if risk == 'low' else 0.1,
                'medium': float(0.3) if risk == 'medium' else 0.1,
                'high': float(failure_probability * 0.6) if risk == 'high' else 0.1,
                'critical': float(failure_probability) if risk == 'critical' else 0.1
            },
            'explanation': explanations[risk],
            'shapFeatures': shap_features,
            'failureTypes': failure_types,
            'featureResponsibilities': feature_responsibilities,
            'modelVersion': '1.0.0',
            'timestamp': pd.Timestamp.now().isoformat(),
            'failureProbability': float(failure_probability),
            'failurePredicted': bool(failure_prediction)
        })
        
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting ML Prediction Service...")
    print("Make sure to run train_model.py first to generate the model!")
    app.run(host='0.0.0.0', port=5000, debug=True)

