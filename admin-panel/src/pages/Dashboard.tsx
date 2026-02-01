import { Link } from 'react-router-dom';
import { Settings, Users, BarChart3, Palette } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
      
      <p className="text-gray-600">
        Welcome to the CAS Admin Panel. Use the navigation to manage your attachment assessment configuration.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          to="/cas-config" 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <Settings className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold">Questions & Archetypes</h3>
          </div>
          <p className="text-sm text-gray-500">
            Edit assessment questions, answer options, and archetype definitions.
          </p>
        </Link>

        <Link 
          to="/prompt-elements" 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Palette className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Prompt Elements</h3>
          </div>
          <p className="text-sm text-gray-500">
            Manage style images and archetype image descriptions for AI.
          </p>
        </Link>

        <Link 
          to="/cas-config" 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Simulator</h3>
          </div>
          <p className="text-sm text-gray-500">
            Test scoring logic with randomized or manual answer selections.
          </p>
        </Link>

        <Link 
          to="/situations" 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Situations</h3>
          </div>
          <p className="text-sm text-gray-500">
            Manage relationship situations and scenarios.
          </p>
        </Link>
      </div>
    </div>
  );
}
