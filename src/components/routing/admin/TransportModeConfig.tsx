import React, { useState } from 'react';

interface TransportMode {
  id: string;
  name: string;
  maxCapacity: number;
  costPerKm: number;
  co2EmissionPerKm: number;
  isAvailable: boolean;
}

export function TransportModeConfig() {
  const [transportModes, setTransportModes] = useState<TransportMode[]>([]);
  const [formData, setFormData] = useState<Omit<TransportMode, 'id'>>({
    name: '',
    maxCapacity: 0,
    costPerKm: 0,
    co2EmissionPerKm: 0,
    isAvailable: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransportMode: TransportMode = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData
    };
    setTransportModes(prev => [...prev, newTransportMode]);
    setFormData({
      name: '',
      maxCapacity: 0,
      costPerKm: 0,
      co2EmissionPerKm: 0,
      isAvailable: true
    });
  };

  const handleDelete = (id: string) => {
    setTransportModes(prev => prev.filter(mode => mode.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Transport Mode Configuration</h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Transport Mode Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Maximum Capacity</label>
            <input
              type="number"
              name="maxCapacity"
              value={formData.maxCapacity}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cost per Kilometer</label>
            <input
              type="number"
              name="costPerKm"
              value={formData.costPerKm}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">CO2 Emission per Kilometer</label>
            <input
              type="number"
              name="co2EmissionPerKm"
              value={formData.co2EmissionPerKm}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm font-medium">Available for Routes</span>
            </label>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Transport Mode
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-xl font-semibold mb-4">Configured Transport Modes</h3>
        <div className="grid gap-4">
          {transportModes.map(mode => (
            <div key={mode.id} className="border p-4 rounded flex justify-between items-start">
              <div>
                <h4 className="font-bold">{mode.name}</h4>
                <p className="text-sm text-gray-600">Capacity: {mode.maxCapacity}</p>
                <p className="text-sm text-gray-600">Cost/km: ${mode.costPerKm.toFixed(2)}</p>
                <p className="text-sm text-gray-600">CO2/km: {mode.co2EmissionPerKm}g</p>
                <span className={`text-sm ${mode.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {mode.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <button
                onClick={() => handleDelete(mode.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}