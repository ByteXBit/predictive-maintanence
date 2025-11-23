'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/contexts/AuthContext';

interface Machine {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  lastMaintenance: string;
  efficiency: number;
}

interface PredictionResponse {
  score: number; // 0-100
  risk: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
  topFeatures: Array<{
    name: string;
    impact: number; // -100 to 100
    description: string;
  }>;
  failureTypes?: {
    TWF: number;
    HDF: number;
    PWF: number;
    OSF: number;
    RNF: number;
  };
  featureResponsibilities?: Array<{
    feature: string;
    value: number;
    responsibleFor: Array<{
      failureType: string;
      probability: number;
      reason: string;
    }>;
  }>;
}

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine;
}

export default function PredictionModal({
  isOpen,
  onClose,
  machine,
}: PredictionModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(today);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Reset when modal closes
  const handleClose = () => {
    setShouldFetch(false);
    onClose();
  };

  const { data: prediction, isLoading, error } = useQuery<PredictionResponse>({
    queryKey: ['prediction', machine.id, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(
        `/api/machines/${machine.id}/predict?startDate=${startDate}&endDate=${endDate}`,
        {
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }
      const data = await response.json();
      
      // Save prediction to history
      if (user) {
        try {
          await fetch('/api/predictions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              machineId: machine.id,
              machineName: machine.name,
              score: data.score,
              risk: data.risk,
              explanation: data.explanation,
              topFeatures: data.topFeatures,
              predictionDate: endDate,
              userId: user.id,
              userEmail: user.email,
              modelVersion: '1.0.0',
            }),
          });
          queryClient.invalidateQueries({ queryKey: ['predictions'] });
        } catch (err) {
          console.error('Failed to save prediction to history:', err);
        }
      }
      
      return data;
    },
    enabled: shouldFetch && !!startDate && !!endDate,
    retry: false,
  });

  const handlePredict = () => {
    if (startDate && endDate) {
      setShouldFetch(true);
    }
  };

  // Create alert mutation
  const createAlertMutation = useMutation({
    mutationFn: async () => {
      if (!prediction || !user) {
        throw new Error('Prediction or user data missing');
      }

      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          machineId: machine.id,
          machineName: machine.name,
          title: `${prediction.risk === 'critical' ? 'Critical' : 'High'} Risk Alert: ${machine.name}`,
          description: `${prediction.explanation} (Score: ${prediction.score})`,
          risk: prediction.risk,
          score: prediction.score,
          predictionDate: endDate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create alert');
      }

      return response.json();
    },
    onSuccess: () => {
      // Refetch alerts after creating
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      alert(`Alert created successfully for ${machine.name}`);
      handleClose();
    },
    onError: (error: Error) => {
      alert(`Failed to create alert: ${error.message}`);
    },
  });

  const handleCreateAlert = () => {
    if (prediction && prediction.risk === 'high') {
      createAlertMutation.mutate();
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculateArcLength = (radius: number, angleDegrees: number) => {
    // Calculate arc length: (angle in radians) * radius
    return (angleDegrees * Math.PI * radius) / 180;
  };

  if (!isOpen) return null;

  const maxDate = today;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={handleClose}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Predictive Analysis: {machine.name}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Date Range Selector */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Date Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={maxDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                onClick={handlePredict}
                disabled={!startDate || !endDate || isLoading}
                className="mt-4 w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analyzing...' : 'Run Prediction'}
              </button>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  Failed to generate prediction. Please try again.
                </p>
              </div>
            )}

            {/* Prediction Results */}
            {prediction && (
              <div className="space-y-6">
                {/* Score Gauge */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Prediction Score
                  </h3>
                  <div className="flex flex-col items-center">
                    {/* Gauge Visualization */}
                    <div className="relative w-64 h-64 mb-4">
                      <svg
                        viewBox="0 0 200 200"
                        className="w-full h-full"
                      >
                        {/* Background Circle - Full 360 degrees */}
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="20"
                          strokeLinecap="round"
                        />
                        {/* Score Circle - Dynamic green fill based on score percentage */}
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="20"
                          strokeLinecap="round"
                          strokeDasharray={`${(prediction.score / 100) * calculateArcLength(80, 360)} ${calculateArcLength(80, 360)}`}
                          strokeDashoffset="0"
                          transform="rotate(-90 100 100)"
                          style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div
                          className={`text-4xl font-bold transition-colors duration-300 ${getScoreColor(
                            prediction.score
                          )}`}
                        >
                          {prediction.score.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">Score</div>
                      </div>
                    </div>

                    {/* Risk Badge */}
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Risk Level:</span>
                      <span
                        className={`px-4 py-2 rounded-full font-semibold text-sm ${getRiskColor(
                          prediction.risk
                        )}`}
                      >
                        {prediction.risk.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Explanation
                  </h3>
                  <p className="text-sm text-blue-800">{prediction.explanation}</p>
                </div>

                {/* Top 3 Features */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Top 3 Contributing Factors
                  </h3>
                  <div className="space-y-4">
                    {prediction.topFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                            <h4 className="font-semibold text-gray-900">
                              {feature.name}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                feature.impact > 0
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {feature.impact > 0 ? '+' : ''}
                              {feature.impact.toFixed(1)}% impact
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 ml-11">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Failure Type Probabilities */}
                {prediction.failureTypes && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Failure Type Probabilities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(prediction.failureTypes).map(([type, prob]) => {
                        const typeNames: Record<string, string> = {
                          TWF: 'Tool Wear Failure',
                          HDF: 'Heat Dissipation Failure',
                          PWF: 'Power Failure',
                          OSF: 'Overstrain Failure',
                          RNF: 'Random Failure',
                        };
                        return (
                          <div key={type} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-900">
                                {typeNames[type] || type}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded ${
                                  prob > 0.5
                                    ? 'bg-red-100 text-red-800'
                                    : prob > 0.2
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {(prob * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  prob > 0.5
                                    ? 'bg-red-500'
                                    : prob > 0.2
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${prob * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Feature Responsibility Analysis */}
                {prediction.featureResponsibilities &&
                  prediction.featureResponsibilities.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Feature Responsibility Analysis
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Which features contribute to which failure types:
                      </p>
                      <div className="space-y-4">
                        {prediction.featureResponsibilities.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {item.feature}: {item.value.toFixed(2)}
                            </h4>
                            <div className="space-y-2">
                              {item.responsibleFor.map((resp, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="text-sm text-gray-700 bg-white p-2 rounded border border-blue-100"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-blue-700">
                                      {resp.failureType}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                        resp.probability > 0.5
                                          ? 'bg-red-100 text-red-800'
                                          : resp.probability > 0.2
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-green-100 text-green-800'
                                      }`}
                                    >
                                      {(resp.probability * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">{resp.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Create Alert Button - Only show when risk is HIGH */}
                {prediction.risk === 'high' && (
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={handleCreateAlert}
                      disabled={
                        createAlertMutation.isPending || !user
                      }
                      className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createAlertMutation.isPending
                        ? 'Creating Alert...'
                        : 'Create Alert'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

