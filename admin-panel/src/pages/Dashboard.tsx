import { useAdmin } from '../lib/AdminContext';

export default function Dashboard() {
  const { seedDatabase, loading } = useAdmin();

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">System Actions</h3>
          <button
            onClick={seedDatabase}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Initializing...' : 'Initialize / Reset Seed Data'}
          </button>
          <p className="mt-2 text-sm text-gray-500">
            Resets the CAS configuration to defaults if missing.
          </p>
        </div>

        {/* Stats Card Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">System Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
