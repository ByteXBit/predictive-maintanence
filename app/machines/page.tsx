'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import PredictionModal from '@/app/components/machines/PredictionModal';

interface Machine {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'warning';
  location: string;
  lastMaintenance: string;
  efficiency: number;
}

const mockMachines: Machine[] = [
  {
    id: '1',
    name: 'Machine A - Production Line 1',
    type: 'CNC Lathe',
    status: 'operational',
    location: 'Factory Floor A',
    lastMaintenance: '2024-01-15',
    efficiency: 94,
  },
  {
    id: '2',
    name: 'Machine B - Production Line 2',
    type: 'Milling Machine',
    status: 'warning',
    location: 'Factory Floor A',
    lastMaintenance: '2024-01-10',
    efficiency: 87,
  },
  {
    id: '3',
    name: 'Machine C - Production Line 1',
    type: 'Assembly Robot',
    status: 'operational',
    location: 'Factory Floor B',
    lastMaintenance: '2024-01-12',
    efficiency: 96,
  },
  {
    id: '4',
    name: 'Machine D - Quality Control',
    type: 'Inspection Station',
    status: 'maintenance',
    location: 'Factory Floor B',
    lastMaintenance: '2024-01-08',
    efficiency: 78,
  },
  {
    id: '5',
    name: 'Machine E - Production Line 3',
    type: 'Packaging System',
    status: 'operational',
    location: 'Factory Floor C',
    lastMaintenance: '2024-01-14',
    efficiency: 92,
  },
  {
    id: '6',
    name: 'Machine F - Material Handling',
    type: 'Conveyor System',
    status: 'warning',
    location: 'Factory Floor C',
    lastMaintenance: '2024-01-09',
    efficiency: 85,
  },
];

export default function MachineListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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

  const getStatusBadge = (status: Machine['status']) => {
    const styles = {
      operational: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-red-100 text-red-800',
    };
    return styles[status] || styles.operational;
  };

  const handlePredict = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMachine(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Machines</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and monitor your equipment
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Machine Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Maintenance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockMachines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {machine.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{machine.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                          machine.status
                        )}`}
                      >
                        {machine.status.charAt(0).toUpperCase() +
                          machine.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {machine.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {machine.lastMaintenance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {machine.efficiency}%
                        </div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              machine.efficiency >= 90
                                ? 'bg-green-500'
                                : machine.efficiency >= 80
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${machine.efficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handlePredict(machine)}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold"
                      >
                        Predict
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedMachine && (
        <PredictionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          machine={selectedMachine}
        />
      )}
    </DashboardLayout>
  );
}

