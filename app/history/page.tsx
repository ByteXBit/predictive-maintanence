'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/app/components/DashboardLayout';

interface Prediction {
  id: string;
  machineId: string;
  machineName: string;
  score: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  topFeatures: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
  predictionDate: string;
  createdAt: string;
  userId?: string;
  userEmail?: string;
  modelVersion?: string;
}

interface Alert {
  id: string;
  machineId: string;
  machineName: string;
  title: string;
  description: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: {
    id: string;
    email: string;
    role: string;
  };
  predictionDate: string;
}

interface HistoryPageProps {}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'predictions' | 'alerts'>(
    'predictions'
  );
  const [dateFilter, setDateFilter] = useState({
    start: '',
    end: '',
  });

  // Fetch predictions
  const {
    data: predictionsData,
    isLoading: predictionsLoading,
  } = useQuery<{ predictions: Prediction[]; total: number }>({
    queryKey: ['predictions', dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFilter.start) params.append('startDate', dateFilter.start);
      if (dateFilter.end) params.append('endDate', dateFilter.end);
      const response = await fetch(`/api/predictions?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch predictions');
      return response.json();
    },
    enabled: selectedTab === 'predictions',
  });

  // Fetch alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery<{
    alerts: Alert[];
    total: number;
  }>({
    queryKey: ['alerts', dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFilter.start) params.append('startDate', dateFilter.start);
      if (dateFilter.end) params.append('endDate', dateFilter.end);
      const response = await fetch(`/api/alerts?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    },
    enabled: selectedTab === 'alerts',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const exportToCSV = () => {
    let csv = '';
    let filename = '';

    if (selectedTab === 'predictions' && predictionsData) {
      filename = `predictions_${new Date().toISOString().split('T')[0]}.csv`;
      // CSV Headers
      csv =
        'ID,Machine Name,Score,Risk,Prediction Date,Created At,User Email,Model Version\n';

      // CSV Rows
      predictionsData.predictions.forEach((pred) => {
        csv += `${pred.id},"${pred.machineName}",${pred.score},${pred.risk},"${pred.predictionDate}","${pred.createdAt}","${pred.userEmail || 'N/A'}","${pred.modelVersion || 'N/A'}"\n`;
      });
    } else if (selectedTab === 'alerts' && alertsData) {
      filename = `alerts_${new Date().toISOString().split('T')[0]}.csv`;
      // CSV Headers
      csv =
        'ID,Machine Name,Title,Risk,Score,Status,Created At,Acknowledged At,Acknowledged By,Prediction Date\n';

      // CSV Rows
      alertsData.alerts.forEach((alert) => {
        csv += `${alert.id},"${alert.machineName}","${alert.title}",${alert.risk},${alert.score},${alert.status},"${alert.createdAt}","${alert.acknowledgedAt || 'N/A'}","${alert.acknowledgedBy?.email || 'N/A'}","${alert.predictionDate}"\n`;
      });
    }

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentData =
    selectedTab === 'predictions' ? predictionsData : alertsData;
  const isLoading =
    selectedTab === 'predictions' ? predictionsLoading : alertsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">History</h1>
            <p className="mt-2 text-sm text-gray-600">
              View predictions and alerts history
            </p>
          </div>
          <button
            onClick={exportToCSV}
            disabled={!currentData || currentData.total === 0 || isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Export CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('predictions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'predictions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Predictions ({predictionsData?.total || 0})
            </button>
            <button
              onClick={() => setSelectedTab('alerts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'alerts'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Alerts ({alertsData?.total || 0})
            </button>
          </nav>
        </div>

        {/* Date Filter */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, start: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, end: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setDateFilter({ start: '', end: '' })}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear Filter
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : selectedTab === 'predictions' ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {predictionsData && predictionsData.predictions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Machine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prediction Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {predictionsData.predictions.map((pred) => (
                      <tr key={pred.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {pred.machineName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {pred.score}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(
                              pred.risk
                            )}`}
                          >
                            {pred.risk.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(pred.predictionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(pred.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pred.userEmail || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                No predictions found
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {alertsData && alertsData.alerts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Machine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acknowledged By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alertsData.alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {alert.machineName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {alert.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(
                              alert.risk
                            )}`}
                          >
                            {alert.risk.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {alert.score}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              alert.status === 'active'
                                ? 'bg-red-100 text-red-800'
                                : alert.status === 'acknowledged'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {alert.status.charAt(0).toUpperCase() +
                              alert.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(alert.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {alert.acknowledgedBy?.email || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                No alerts found
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

