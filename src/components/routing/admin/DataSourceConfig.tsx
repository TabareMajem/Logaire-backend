import { useState } from 'react';

interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file';
  connectionString: string;
  isActive: boolean;
}

export function DataSourceConfig() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [newDataSource, setNewDataSource] = useState<Partial<DataSource>>({
    type: 'api',
    isActive: true,
  });

  const handleAddDataSource = () => {
    if (newDataSource.name && newDataSource.connectionString) {
      setDataSources([
        ...dataSources,
        {
          ...newDataSource,
          id: Date.now().toString(),
          type: newDataSource.type || 'api',
          isActive: true,
        } as DataSource,
      ]);
      setNewDataSource({ type: 'api', isActive: true });
    }
  };

  const handleDeleteDataSource = (id: string) => {
    setDataSources(dataSources.filter((ds) => ds.id !== id));
  };

  const toggleDataSourceStatus = (id: string) => {
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id ? { ...ds, isActive: !ds.isActive } : ds
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Data Sources</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={newDataSource.name || ''}
                onChange={(e) =>
                  setNewDataSource({ ...newDataSource, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={newDataSource.type}
                onChange={(e) =>
                  setNewDataSource({
                    ...newDataSource,
                    type: e.target.value as DataSource['type'],
                  })
                }
              >
                <option value="api">API</option>
                <option value="database">Database</option>
                <option value="file">File System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Connection String
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={newDataSource.connectionString || ''}
                onChange={(e) =>
                  setNewDataSource({
                    ...newDataSource,
                    connectionString: e.target.value,
                  })
                }
              />
            </div>
            <button
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              onClick={handleAddDataSource}
            >
              Add Data Source
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Configured Data Sources</h3>
        <div className="grid grid-cols-1 gap-4">
          {dataSources.map((source) => (
            <div
              key={source.id}
              className="border rounded p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="font-medium">{source.name}</h4>
                <p className="text-sm text-gray-600">Type: {source.type}</p>
                <p className="text-sm text-gray-600 truncate max-w-md">
                  Connection: {source.connectionString}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  className={`px-3 py-1 rounded ${
                    source.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                  onClick={() => toggleDataSourceStatus(source.id)}
                >
                  {source.isActive ? 'Active' : 'Inactive'}
                </button>
                <button
                  className="px-3 py-1 rounded bg-red-100 text-red-800"
                  onClick={() => handleDeleteDataSource(source.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}