# Predictive Maintenance System

A comprehensive predictive maintenance platform built with Next.js, TypeScript, and machine learning. This system uses XGBoost models to predict machine failures and provides role-based dashboards for operators, maintenance staff, and managers.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![XGBoost](https://img.shields.io/badge/ML-XGBoost-orange)

## 🎯 Features

### Core Functionality
- **Machine Learning Predictions**: Real-time failure predictions using trained XGBoost models
- **Dynamic Telemetry**: Simulated sensor data that varies by machine, date range, and operational status
- **Failure Type Analysis**: Predicts specific failure types (TWF, HDF, PWF, OSF, RNF) with probabilities
- **Feature Responsibility**: Shows which telemetry features contribute to each failure type
- **Role-Based Dashboards**: Customized views for Operators, Maintenance, and Managers
- **Alert System**: Automatic and manual alert creation with acknowledgment workflow
- **Historical Tracking**: Complete audit trail of predictions and alerts with CSV export

### ML Integration
- **Real XGBoost Model**: Trained on AI4I 2020 dataset
- **SHAP-like Explanations**: Feature importance and impact analysis
- **Dynamic Telemetry Generation**: Realistic sensor data simulation
- **Fallback System**: Graceful degradation if ML service unavailable

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Next.js App    │────▶│  Express API    │────▶│  Python ML     │
│  (Port 3000)    │     │  (Port 3001)     │     │  Service        │
│                 │     │                  │     │  (Port 5000)    │
│  - Frontend     │     │  - JWT Auth      │     │  - XGBoost      │
│  - API Routes   │     │  - User Mgmt     │     │  - Predictions  │
│  - Components   │     │  - Alerts        │     │  - SHAP Values │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ and pip
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ByteXBit/predictive-maintanence.git
   cd predictive-maintanence
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   cd ml_service
   pip install -r requirements.txt
   cd ..
   ```

4. **Train the ML model** (First time only)
   ```bash
   cd ml_service
   python train_model.py
   cd ..
   ```

5. **Set up environment variables**
   
   Create `.env` file in the root directory:
   ```env
   PORT=3001
   JWT_SECRET=your-secret-key-change-in-production
   ML_SERVICE_URL=http://localhost:5000
   ```

### Running the Application

You need **3 terminals** running simultaneously:

**Terminal 1 - Next.js Frontend:**
```bash
npm run dev
```
Access at: http://localhost:3000

**Terminal 2 - Express API Server:**
```bash
npm run dev:api
```
Access at: http://localhost:3001

**Terminal 3 - Python ML Service:**
```bash
cd ml_service
python predict_service.py
```
Access at: http://localhost:5000

## 📊 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Operator** | `operator@example.com` | `Password123!` |
| **Maintenance** | `maintenance@example.com` | `Password123!` |
| **Manager** | `manager@example.com` | `Password123!` |

## 🎨 UI Design

The UI design is available on Figma:
[**Predictive Maintenance Software Design**](https://www.figma.com/design/q6dYkSw63koewu8zG4NloU/Predictive-Maintainance-Software)

## 📁 Project Structure

```
predictive-maintenance-demo/
├── api/                      # Express API server
│   ├── server.ts            # Main API server with JWT auth
│   └── tsconfig.json
├── app/                      # Next.js App Router
│   ├── api/                 # Next.js API routes
│   │   ├── alerts/         # Alert management
│   │   ├── auth/           # Authentication
│   │   ├── machines/       # Machine predictions
│   │   ├── ml/            # ML prediction proxy
│   │   ├── predictions/   # Prediction history
│   │   ├── seed/          # Demo data seeding
│   │   └── telemetry/     # Dynamic telemetry generation
│   ├── components/          # React components
│   │   ├── AlertsPanel.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── dashboard/     # Role-specific dashboards
│   │   └── machines/      # Machine-related components
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx
│   ├── alerts/            # Alerts page
│   ├── dashboard/        # Dashboard page
│   ├── history/          # History page
│   ├── login/           # Login page
│   └── machines/         # Machines list page
├── ml_service/            # Python ML service
│   ├── models/          # Trained models
│   │   ├── xgb_model.pkl
│   │   ├── label_encoder.pkl
│   │   └── feature_names.txt
│   ├── train_model.py   # Model training script
│   ├── predict_service.py # Flask prediction service
│   └── requirements.txt
├── docs/                  # Documentation
│   └── demo-script.md    # Demo walkthrough
├── scripts/              # Utility scripts
│   ├── validate-all.ps1  # PowerShell validation
│   └── test-all.sh       # Bash testing
├── ai4i2020 (1).csv      # Training dataset
└── README.md
```

## 🔧 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **React Query** - Server state management
- **React Context** - Authentication state

### Backend
- **Express.js** - API server
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **cookie-parser** - HttpOnly cookies

### Machine Learning
- **XGBoost** - Gradient boosting model
- **scikit-learn** - ML utilities
- **Flask** - Python API service
- **pandas/numpy** - Data processing

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

### Machines & Predictions
- `GET /api/machines/[id]/predict?startDate=X&endDate=Y` - Get prediction
- `GET /api/telemetry/[id]?startDate=X&endDate=Y` - Get telemetry data
- `POST /api/ml/predict` - ML model prediction

### Alerts
- `GET /api/alerts` - List alerts (filterable)
- `POST /api/alerts` - Create alert
- `PATCH /api/alerts/[id]/acknowledge` - Acknowledge alert

### History
- `GET /api/predictions` - List predictions
- `POST /api/predictions` - Save prediction

### Utilities
- `POST /api/seed` - Seed demo data
- `GET /health` - Health check (Express API)
- `GET /health` - Health check (ML Service)

## 🤖 Machine Learning Model

### Model Details
- **Algorithm**: XGBoost Classifier
- **Dataset**: AI4I 2020 Predictive Maintenance Dataset
- **Features**: 8 features including:
  - Air temperature [K]
  - Process temperature [K]
  - Rotational speed [rpm]
  - Torque [Nm]
  - Tool wear [min]
  - Type (encoded)
  - temperature_difference (derived)
  - Mechanical Power [W] (derived)

### Failure Types Predicted
- **TWF** (Tool Wear Failure) - High tool wear
- **HDF** (Heat Dissipation Failure) - High temperature difference
- **PWF** (Power Failure) - Low torque/power
- **OSF** (Overstrain Failure) - High rotational speed
- **RNF** (Random Failure) - Combination of factors

### Training the Model
```bash
cd ml_service
python train_model.py
```

This will:
1. Load the dataset from `../ai4i2020 (1).csv`
2. Preprocess and engineer features
3. Train XGBoost model
4. Save model to `models/xgb_model.pkl`
5. Save preprocessing objects

## 🎯 Key Features Explained

### Dynamic Telemetry
Telemetry data is generated dynamically based on:
- **Machine ID**: Each machine has unique characteristics
- **Date Range**: Different periods produce different values
- **Time-based Degradation**: Machines degrade over time
- **Operational Cycles**: Realistic hourly patterns
- **Machine Status**: Operational/warning/maintenance affects values

### Prediction Flow
1. User selects machine and date range
2. System generates dynamic telemetry for that period
3. Telemetry sent to ML service
4. ML model returns prediction with:
   - Health score (0-100)
   - Risk level (low/medium/high/critical)
   - Failure type probabilities
   - Feature responsibilities
5. Results displayed with gauge visualization

### Role-Based Access
- **Operator**: View machines, run predictions, see basic alerts
- **Maintenance**: Acknowledge alerts, view maintenance tasks
- **Manager**: Full access, KPI dashboards, historical reports

## 🧪 Testing

### Quick Test
```powershell
# Test all services
.\scripts\validate-all.ps1
```

### Manual Testing
1. **Health Checks**:
   ```bash
   curl http://localhost:3000/api/telemetry/1?startDate=2024-01-01&endDate=2024-01-31
   curl http://localhost:3001/health
   curl http://localhost:5000/health
   ```

2. **Full Prediction Flow**:
   ```bash
   curl "http://localhost:3000/api/machines/1/predict?startDate=2024-01-01&endDate=2024-01-31"
   ```

See [QUICK_TEST.md](./QUICK_TEST.md) for detailed testing instructions.

## 📚 Documentation

- **[Demo Script](./docs/demo-script.md)** - Step-by-step demo walkthrough
- **[Validation Guide](./VALIDATION.md)** - Comprehensive testing guide
- **[Quick Test](./QUICK_TEST.md)** - Quick verification steps
- **[ML Service README](./ml_service/README.md)** - ML service documentation

## 🔐 Security Notes

- JWT tokens stored in HttpOnly cookies
- Passwords hashed with bcrypt
- Role-based access control
- CORS configured for development

**⚠️ Production Considerations:**
- Change `JWT_SECRET` to a strong random string
- Use environment variables for all secrets
- Replace in-memory storage with database
- Enable HTTPS
- Add rate limiting
- Implement proper error handling

## 🚧 Future Enhancements

- [ ] Automatic threshold-based alerts
- [ ] Email/Slack notifications
- [ ] Real-time WebSocket updates
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Advanced analytics dashboard
- [ ] Mobile app for on-site maintenance
- [ ] Multi-tenant support
- [ ] API rate limiting
- [ ] Comprehensive logging
- [ ] Unit and integration tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is for demonstration and educational purposes.

## 🙏 Acknowledgments

- **Dataset**: AI4I 2020 Predictive Maintenance Dataset
- **Design**: Figma design system
- **Technologies**: Next.js, XGBoost, scikit-learn

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review the demo script for usage examples

---

**Built with ❤️ for predictive maintenance**
