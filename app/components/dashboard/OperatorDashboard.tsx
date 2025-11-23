'use client';

import AlertsPanel from '@/app/components/AlertsPanel';

interface OperatorDashboardProps {
  user: {
    id: string;
    email: string;
    role: 'OPERATOR';
  };
}

export default function OperatorDashboard({ user }: OperatorDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Alerts Panel */}
      <AlertsPanel maxAlerts={3} />
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Operator Dashboard</h2>
        <p className="text-gray-600">Welcome, {user.email}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Equipment Status Cards */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Equipment</h3>
          <p className="text-3xl font-bold text-indigo-600">24</p>
          <p className="text-sm text-gray-500 mt-1">Currently running</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Alerts</h3>
          <p className="text-3xl font-bold text-yellow-600">3</p>
          <p className="text-sm text-gray-500 mt-1">Requires attention</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Efficiency</h3>
          <p className="text-3xl font-bold text-green-600">94%</p>
          <p className="text-sm text-gray-500 mt-1">Average uptime</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Operations</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-gray-900">Machine A - Production Started</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
            <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-gray-900">Machine B - Quality Check</p>
              <p className="text-sm text-gray-500">4 hours ago</p>
            </div>
            <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded">
              In Progress
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-gray-900">Machine C - Scheduled Maintenance</p>
              <p className="text-sm text-gray-500">6 hours ago</p>
            </div>
            <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded">
              Pending
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

