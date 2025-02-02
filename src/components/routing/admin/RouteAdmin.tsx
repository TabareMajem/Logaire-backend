// src/components/routing/admin/RouteAdmin.tsx -->

import { useState } from 'react';
import { DataSourceConfig } from './DataSourceConfig';
import { OptimizationSettings } from './OptimizationSettings';
import { RouteForm } from './RouteForm';
import { TransportModeConfig } from './TransportModeConfig';

export function RouteAdmin() {
  const [activeTab, setActiveTab] = useState('routes');

  return (
    <div className="container mx-auto p-4">
      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'routes' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('routes')}
        >
          Routes
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'transport' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('transport')}
        >
          Transport Modes
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'datasources' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('datasources')}
        >
          Data Sources
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'optimization' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('optimization')}
        >
          Optimization
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'routes' && <RouteForm />}
        {activeTab === 'transport' && <TransportModeConfig />}
        {activeTab === 'datasources' && <DataSourceConfig />}
        {activeTab === 'optimization' && <OptimizationSettings />}
      </div>
    </div>
  );
} 