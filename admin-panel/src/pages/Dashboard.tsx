import { Link } from 'react-router-dom';
import { Settings, Users, BarChart3, Palette, Heart, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usageApi } from '../lib/api';
import type { UsageStats } from '../lib/types';

export default function Dashboard() {
  const [usage, setUsage] = useState<UsageStats | null>(null);

  useEffect(() => {
    usageApi.getStats().then(setUsage).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
      
      <p className="text-gray-600">
        Welcome to the CAS Admin Panel. Use the navigation to manage your attachment assessment configuration.
      </p>

      {/* Billing & Usage */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-indigo-600" />
          Usage & Billing (Estimated)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Today</div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-gray-900">{usage?.today.count || 0} <span className="text-sm font-normal text-gray-500">requests</span></span>
              <span className="text-lg font-mono font-medium text-green-600">${(usage?.today.cost || 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">This Week</div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-gray-900">{usage?.week.count || 0} <span className="text-sm font-normal text-gray-500">requests</span></span>
              <span className="text-lg font-mono font-medium text-green-600">${(usage?.week.cost || 0).toFixed(2)}</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">This Month</div>
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-gray-900">{usage?.month.count || 0} <span className="text-sm font-normal text-gray-500">requests</span></span>
              <span className="text-lg font-mono font-medium text-green-600">${(usage?.month.cost || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
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
          to="/global-settings" 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Palette className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Global Settings</h3>
          </div>
          <p className="text-sm text-gray-500">
            Manage style images and archetype image descriptions for AI.
          </p>
        </Link>

        <Link 
          to="/cas-config?tab=simulator" 
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

        <Link 
          to="/affects" 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-pink-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
              <Heart className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold">Affects</h3>
          </div>
          <p className="text-sm text-gray-500">
            Manage the 9 core affects and their interaction guidance.
          </p>
        </Link>
      </div>
    </div>
  );
}
