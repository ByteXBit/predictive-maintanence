# Predictive Maintenance Software - Demo Script

## Overview
This script provides a step-by-step walkthrough for demonstrating the Predictive Maintenance Software. Follow these 10 steps to showcase the key features and workflows.
---

## Demo Walkthrough (10 Steps)

### 1. **Login as Manager**
- Navigate to the login page
- Enter credentials:
  - **Email:** `manager@example.com`
  - **Password:** `Password123!`
- Click "Sign in"
- **Point to demonstrate:** Role-based authentication, JWT cookie storage

### 2. **Show KPI Cards on Dashboard**
- After login, you'll see the Manager Dashboard
- **Point out:**
  - Overall Efficiency: 92%
  - Downtime Hours: 24h
  - Maintenance Cost: $45K
  - Equipment Status: 28/30 operational
- **Point to demonstrate:** High-level metrics, department overview, recent reports

### 3. **Navigate to Machines Page**
- Click "Machines" in the navigation bar
- Show the list of 6 machines with their statuses
- **Point out:**
  - Different machine types (CNC Lathe, Milling Machine, etc.)
  - Status badges (Operational, Warning, Maintenance)
  - Efficiency percentages
- **Point to demonstrate:** Machine inventory management, status visualization

### 4. **Open a Machine and Run Prediction**
- Click the "Predict" button on "Machine B - Production Line 2" (has warning status)
- In the modal:
  - Show date range selector (default: last 30 days)
  - Click "Run Prediction"
  - Wait for prediction to load (~1 second)
- **Point out:**
  - Gauge visualization showing score
  - Risk level badge
  - Explanation text
  - Top 3 contributing factors with impact values
- **Point to demonstrate:** Predictive analytics, explainable AI features

### 5. **Create Alert (if risk is HIGH)**
- If the prediction shows `risk: HIGH`:
  - Click "Create Alert" button (red button at bottom)
  - Alert is created successfully
  - Modal closes automatically
- **Point to demonstrate:** Alert creation workflow, risk-based actions

### 6. **View Alerts in AlertsPanel**
- Return to Dashboard (click "Dashboard" in nav)
- Scroll to see the AlertsPanel at the top
- Show the newly created alert
- **Point out:**
  - Alert title and machine name
  - Risk level badge
  - Score and status
  - Creation timestamp
- **Point to demonstrate:** Real-time alert monitoring, alert management

### 7. **Switch to Maintenance Role**
- Logout (click "Logout" button)
- Login as Maintenance:
  - **Email:** `maintenance@example.com`
  - **Password:** `Password123!`
- Show the Maintenance Dashboard
- **Point out:**
  - Pending Tasks: 7
  - In Progress: 2
  - Completed: 15
  - Upcoming maintenance tasks with priorities
  - Predictive maintenance alerts
- **Point to demonstrate:** Role-specific dashboard, maintenance workflow view

### 8. **Maintenance Acknowledges Alert**
- Scroll to AlertsPanel on Maintenance Dashboard
- Find an active alert
- Click "Acknowledge" button
- **Point out:**
  - Alert status changes to "Acknowledged"
  - Shows who acknowledged it (maintenance@example.com)
  - Shows timestamp of acknowledgment
- **Point to demonstrate:** Alert acknowledgment workflow, user logging

### 9. **Manager Views History**
- Logout and login back as Manager
- Click "History" in navigation bar
- Show the History page with two tabs:
  - **Predictions tab:** Shows all prediction records
  - **Alerts tab:** Shows all alerts (including acknowledged ones)
- **Point out:**
  - Date filtering options
  - Table view with machine names, scores, risk levels
  - Timestamps for all actions
  - User attribution (who ran predictions, who acknowledged alerts)
- **Point to demonstrate:** Audit trail, historical data tracking

### 10. **Export CSV**
- On History page, ensure there's visible data
- Click "Export CSV" button at the top right
- **Point out:**
  - CSV file downloads automatically
  - Contains all visible data (predictions or alerts based on selected tab)
  - Includes all relevant fields (machine, score, risk, dates, users)
- **Point to demonstrate:** Data export functionality, reporting capabilities

---

## Quick Tips for Presenter

1. **Before starting:** Run `/api/seed` endpoint to populate demo data (predictions and alerts)
2. **Timing:** Each step takes 1-2 minutes; full demo ~15-20 minutes
3. **Highlights:** 
   - Focus on role-based features (Manager vs Maintenance)
   - Emphasize explainability (top features, SHAP-like values)
   - Show real-time updates (alerts appearing after creation)
4. **If something breaks:** All endpoints are mock APIs, so data resets on refresh
5. **Key selling points:**
   - Predictive analytics prevents downtime
   - Explainable AI builds trust
   - Role-based workflows streamline operations
   - Historical tracking enables continuous improvement

---

## Demo Account Credentials

| Role | Email | Password |
|------|-------|----------|
| Operator | operator@example.com | Password123! |
| Maintenance | maintenance@example.com | Password123! |
| Manager | manager@example.com | Password123! |

---

## Additional Features to Mention (if time permits)

- **Machine Details:** Click on the machine name to see detailed information
- **Date Filtering:** Filter predictions/alerts by date range
- **Risk Levels:** Color-coded risk indicators throughout the app
- **Model Versioning:** Track which ML model version was used
- **Future Enhancements:**
  - Email/Slack notifications
  - Full SHAP explanations
  - Interactive charts and graphs
  - Mobile app for on-site maintenance

---

## Troubleshooting

- **Can't see alerts:** Check if prediction was created with risk=HIGH
- **CSV not downloading:** Ensure there's visible data in the current tab
- **Login fails:** Verify password is `Password123!` (case-sensitive)
- **No demo data:** POST to `/api/seed` endpoint to populate sample data

