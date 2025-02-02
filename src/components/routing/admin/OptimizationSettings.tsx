import { useState } from 'react';

interface OptimizationConfig {
  routeOptimization: {
    enabled: boolean;
    maxDistance: number;
    maxStops: number;
    priorityFactor: number;
  };
  loadBalancing: {
    enabled: boolean;
    maxLoad: number;
    balancingFactor: number;
  };
  timeWindows: {
    enabled: boolean;
    defaultWindow: number;
    flexibility: number;
  };
}

export function OptimizationSettings() {
  const [config, setConfig] = useState<OptimizationConfig>({
    routeOptimization: {
      enabled: true,
      maxDistance: 100,
      maxStops: 20,
      priorityFactor: 0.5,
    },
    loadBalancing: {
      enabled: true,
      maxLoad: 1000,
      balancingFactor: 0.7,
    },
    timeWindows: {
      enabled: true,
      defaultWindow: 30,
      flexibility: 15,
    },
  });

  const handleRouteOptimizationChange = (
    field: keyof OptimizationConfig['routeOptimization'],
    value: number | boolean
  ) => {
    setConfig({
      ...config,
      routeOptimization: {
        ...config.routeOptimization,
        [field]: value,
      },
    });
  };

  const handleLoadBalancingChange = (
    field: keyof OptimizationConfig['loadBalancing'],
    value: number | boolean
  ) => {
    setConfig({
      ...config,
      loadBalancing: {
        ...config.loadBalancing,
        [field]: value,
      },
    });
  };

  const handleTimeWindowsChange = (
    field: keyof OptimizationConfig['timeWindows'],
    value: number | boolean
  ) => {
    setConfig({
      ...config,
      timeWindows: {
        ...config.timeWindows,
        [field]: value,
      },
    });
  };

  const handleSaveSettings = () => {
    // Here you would typically save the settings to your backend
    console.log('Saving settings:', config);
    // Add API call or storage logic here
  };

  const handleResetSettings = () => {
    setConfig({
      routeOptimization: {
        enabled: true,
        maxDistance: 100,
        maxStops: 20,
        priorityFactor: 0.5,
      },
      loadBalancing: {
        enabled: true,
        maxLoad: 1000,
        balancingFactor: 0.7,
      },
      timeWindows: {
        enabled: true,
        defaultWindow: 30,
        flexibility: 15,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-6">Optimization Settings</h2>
        
        {/* Route Optimization Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Route Optimization</h3>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-500"
                checked={config.routeOptimization.enabled}
                onChange={(e) =>
                  handleRouteOptimizationChange('enabled', e.target.checked)
                }
              />
              <span className="ml-2">Enable</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Distance (km)
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={config.routeOptimization.maxDistance}
                onChange={(e) =>
                  handleRouteOptimizationChange(
                    'maxDistance',
                    parseInt(e.target.value)
                  )
                }
                disabled={!config.routeOptimization.enabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Stops
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={config.routeOptimization.maxStops}
                onChange={(e) =>
                  handleRouteOptimizationChange(
                    'maxStops',
                    parseInt(e.target.value)
                  )
                }
                disabled={!config.routeOptimization.enabled}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Priority Factor (0-1)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="mt-1 block w-full"
                value={config.routeOptimization.priorityFactor}
                onChange={(e) =>
                  handleRouteOptimizationChange(
                    'priorityFactor',
                    parseFloat(e.target.value)
                  )
                }
                disabled={!config.routeOptimization.enabled}
              />
              <div className="text-center">
                {config.routeOptimization.priorityFactor}
              </div>
            </div>
          </div>
        </div>

        {/* Load Balancing Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Load Balancing</h3>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-500"
                checked={config.loadBalancing.enabled}
                onChange={(e) =>
                  handleLoadBalancingChange('enabled', e.target.checked)
                }
              />
              <span className="ml-2">Enable</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Load
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={config.loadBalancing.maxLoad}
                onChange={(e) =>
                  handleLoadBalancingChange('maxLoad', parseInt(e.target.value))
                }
                disabled={!config.loadBalancing.enabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Balancing Factor (0-1)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                className="mt-1 block w-full"
                value={config.loadBalancing.balancingFactor}
                onChange={(e) =>
                  handleLoadBalancingChange(
                    'balancingFactor',
                    parseFloat(e.target.value)
                  )
                }
                disabled={!config.loadBalancing.enabled}
              />
              <div className="text-center">
                {config.loadBalancing.balancingFactor}
              </div>
            </div>
          </div>
        </div>

        {/* Time Windows Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Time Windows</h3>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-500"
                checked={config.timeWindows.enabled}
                onChange={(e) =>
                  handleTimeWindowsChange('enabled', e.target.checked)
                }
              />
              <span className="ml-2">Enable</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Default Window (minutes)
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={config.timeWindows.defaultWindow}
                onChange={(e) =>
                  handleTimeWindowsChange(
                    'defaultWindow',
                    parseInt(e.target.value)
                  )
                }
                disabled={!config.timeWindows.enabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Flexibility (minutes)
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={config.timeWindows.flexibility}
                onChange={(e) =>
                  handleTimeWindowsChange(
                    'flexibility',
                    parseInt(e.target.value)
                  )
                }
                disabled={!config.timeWindows.enabled}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleResetSettings}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}