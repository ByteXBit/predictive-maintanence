'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/contexts/AuthContext';
import { useState } from 'react';

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

interface AlertsPanelProps {
  maxAlerts?: number;
  showAll?: boolean;
}

export default function AlertsPanel({
  maxAlerts = 5,
  showAll = false,
}: AlertsPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>(
    'all'
  );

  // Fetch alerts
  const { data, isLoading, error } = useQuery<{ alerts: Alert[]; total: number }>({
    queryKey: ['alerts', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      const response = await fetch(`/api/alerts?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Acknowledge mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }

      return response.json();
    },
    onSuccess: () => {
      // Refetch alerts after acknowledging
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayedAlerts = showAll
    ? data?.alerts || []
    : (data?.alerts || []).slice(0, maxAlerts);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-600">Failed to load alerts. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Alerts</h2>
          <p className="text-sm text-gray-500 mt-1">
            {data?.total || 0} total alert{data?.total !== 1 ? 's' : ''}
          </p>
        </div>
        {showAll && (
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'active'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('acknowledged')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'acknowledged'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Acknowledged
            </button>
          </div>
        )}
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-gray-200">
        {displayedAlerts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No alerts found</p>
          </div>
        ) : (
          displayedAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors border-l-4 ${getRiskColor(
                alert.risk
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getRiskColor(
                        alert.risk
                      )}`}
                    >
                      {alert.risk.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                        alert.status
                      )}`}
                    >
                      {alert.status.charAt(0).toUpperCase() +
                        alert.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Score: {alert.score}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {alert.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {alert.machineName}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {formatDate(alert.createdAt)}</span>
                    {alert.acknowledgedBy && (
                      <span>
                        Acknowledged by {alert.acknowledgedBy.email} (
                        {alert.acknowledgedBy.role}) at{' '}
                        {formatDate(alert.acknowledgedAt!)}
                      </span>
                    )}
                  </div>
                </div>
                {alert.status === 'active' && (
                  <button
                    onClick={() => acknowledgeMutation.mutate(alert.id)}
                    disabled={acknowledgeMutation.isPending || !user}
                    className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {acknowledgeMutation.isPending ? 'Acknowledging...' : 'Acknowledge'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show More Link */}
      {!showAll && data && data.total > maxAlerts && (
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <a
            href="/alerts"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View all {data.total} alerts →
          </a>
        </div>
      )}
    </div>
  );
}

