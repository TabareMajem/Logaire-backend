import React, { useState } from 'react';

interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  description: string;
  isActive: boolean;
}

export function RouteForm() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [formData, setFormData] = useState<Omit<Route, 'id'>>({
    name: '',
    startPoint: '',
    endPoint: '',
    description: '',
    isActive: true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoute: Route = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData
    };
    setRoutes(prev => [...prev, newRoute]);
    setFormData({
      name: '',
      startPoint: '',
      endPoint: '',
      description: '',
      isActive: true
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Route Management</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Route Name</label>
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
            <label className="block text-sm font-medium mb-2">Start Point</label>
            <input
              type="text"
              name="startPoint"
              value={formData.startPoint}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Point</label>
            <input
              type="text"
              name="endPoint"
              value={formData.endPoint}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm font-medium">Active Route</span>
            </label>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Route
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-xl font-semibold mb-4">Existing Routes</h3>
        <div className="grid gap-4">
          {routes.map(route => (
            <div key={route.id} className="border p-4 rounded">
              <h4 className="font-bold">{route.name}</h4>
              <p className="text-sm text-gray-600">
                {route.startPoint} → {route.endPoint}
              </p>
              <p className="text-sm mt-2">{route.description}</p>
              <div className="mt-2">
                <span className={`text-sm ${route.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {route.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}