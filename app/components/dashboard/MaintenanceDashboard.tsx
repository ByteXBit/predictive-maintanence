'use client';

import AlertsPanel from '@/app/components/AlertsPanel';

interface MaintenanceDashboardProps {
  user: {
    id: string;
    email: string;
    role: 'MAINTENANCE';
  };
}

export default function MaintenanceDashboard({ user }: MaintenanceDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Alerts Panel */}
      <AlertsPanel maxAlerts={5} />
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Maintenance Dashboard</h2>
        <p className="text-gray-600">Welcome, {user.email}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Maintenance Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Tasks</h3>
          <p className="text-3xl font-bold text-orange-600">7</p>
          <p className="text-sm text-gray-500 mt-1">Scheduled maintenance</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-blue-600">2</p>
          <p className="text-sm text-gray-500 mt-1">Active maintenance</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">15</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
      </div>

      {/* Maintenance Tasks */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Maintenance Tasks</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
            <div>
              <p className="font-medium text-gray-900">Machine A - Routine Inspection</p>
              <p className="text-sm text-gray-600">Due: Today, 3:00 PM</p>
              <p className="text-sm text-gray-500 mt-1">Oil change and filter replacement</p>
            </div>
            <span className="px-3 py-1 text-sm font-semibold text-orange-800 bg-orange-200 rounded">
              High Priority
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <div>
              <p className="font-medium text-gray-900">Machine B - Belt Replacement</p>
              <p className="text-sm text-gray-600">Due: Tomorrow, 9:00 AM</p>
              <p className="text-sm text-gray-500 mt-1">Check and replace drive belts</p>
            </div>
            <span className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-200 rounded">
              Medium Priority
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <div>
              <p className="font-medium text-gray-900">Machine C - Calibration Check</p>
              <p className="text-sm text-gray-600">Due: Next Week</p>
              <p className="text-sm text-gray-500 mt-1">Monthly calibration verification</p>
            </div>
            <span className="px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-200 rounded">
              Low Priority
            </span>
          </div>
        </div>
      </div>

      {/* Predictive Maintenance Alerts */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Maintenance Alerts</h3>
        <div className="space-y-2">
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="font-medium text-red-900">Machine D - Vibration Anomaly Detected</p>
            <p className="text-sm text-red-700">Unusual vibration patterns suggest bearing wear. Recommend inspection within 48 hours.</p>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="font-medium text-yellow-900">Machine E - Temperature Trend</p>
            <p className="text-sm text-yellow-700">Gradual temperature increase observed. Monitor closely.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

