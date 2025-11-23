'use client';

import AlertsPanel from '@/app/components/AlertsPanel';

interface ManagerDashboardProps {
  user: {
    id: string;
    email: string;
    role: 'MANAGER';
  };
}

export default function ManagerDashboard({ user }: ManagerDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Alerts Panel */}
      <AlertsPanel maxAlerts={5} />
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Manager Dashboard</h2>
        <p className="text-gray-600">Welcome, {user.email}!</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Overall Efficiency</h3>
          <p className="text-3xl font-bold text-indigo-600">92%</p>
          <p className="text-sm text-gray-500 mt-1">↑ 2% from last month</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Downtime Hours</h3>
          <p className="text-3xl font-bold text-red-600">24h</p>
          <p className="text-sm text-gray-500 mt-1">↓ 15% from last month</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Maintenance Cost</h3>
          <p className="text-3xl font-bold text-green-600">$45K</p>
          <p className="text-sm text-gray-500 mt-1">↓ 8% from last month</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Equipment Status</h3>
          <p className="text-3xl font-bold text-blue-600">28/30</p>
          <p className="text-sm text-gray-500 mt-1">93% operational</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Overview */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Operations</span>
                <span className="text-sm font-semibold text-gray-900">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Maintenance</span>
                <span className="text-sm font-semibold text-gray-900">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Quality Control</span>
                <span className="text-sm font-semibold text-gray-900">91%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
          <div className="space-y-3">
            <div className="flex items-start justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Monthly Performance Report</p>
                <p className="text-sm text-gray-500">Generated: 2 days ago</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
                Complete
              </span>
            </div>
            <div className="flex items-start justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Maintenance Cost Analysis</p>
                <p className="text-sm text-gray-500">Generated: 5 days ago</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
                Complete
              </span>
            </div>
            <div className="flex items-start justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">Predictive Maintenance Forecast</p>
                <p className="text-sm text-gray-500">In progress...</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Status Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Status Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Machine A
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
                    Operational
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2024-01-15
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  96%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Machine B
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded">
                    Maintenance Required
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2024-01-10
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  88%
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Machine C
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
                    Operational
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  2024-01-12
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  94%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

