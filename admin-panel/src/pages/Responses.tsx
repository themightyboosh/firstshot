import { useEffect, useState } from 'react';
import { responsesApi } from '../lib/api';
import type { UserResponse } from '../lib/types';
import { Loader2, RefreshCw, ChevronDown, ChevronUp, Clock, User, Trash2 } from 'lucide-react';

export default function Responses() {
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const data = await responsesApi.getAll();
      setResponses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearResponses = async () => {
    if (!confirm(`Are you sure you want to delete all ${responses.length} responses? This cannot be undone.`)) return;
    
    setClearing(true);
    try {
      const result = await responsesApi.clear();
      setResponses([]);
      alert(`Successfully deleted ${result.deletedCount} responses.`);
    } catch (err) {
      console.error(err);
      alert('Failed to clear responses');
    } finally {
      setClearing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading && responses.length === 0) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">User Responses</h2>
          <p className="text-gray-500 text-sm sm:text-base">History of user questionnaire completions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadResponses}
            disabled={loading}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleClearResponses}
            disabled={clearing || responses.length === 0}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm"
          >
            {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Clear All</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {responses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No responses captured yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scores</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {responses.map((item) => (
                <>
                  <tr 
                    key={item.id} 
                    onClick={() => toggleExpand(item.id)}
                    className={`hover:bg-gray-50 cursor-pointer ${expandedId === item.id ? 'bg-gray-50' : ''}`}
                  >
                    <td className="px-6 py-4 text-gray-400">
                      {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-[150px]" title={item.userId}>{item.userId || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                        {item.result?.archetype?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.result?.primaryTerrain} / {item.result?.secondaryTerrain || 'None'}
                    </td>
                  </tr>
                  
                  {expandedId === item.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Answers</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {Object.entries(item.answers).map(([qId, ans]: [string, any]) => (
                                <div key={qId} className="text-sm bg-white p-2 rounded border border-gray-200">
                                  <span className="font-mono text-xs text-gray-400 block mb-1">{qId}</span>
                                  {typeof ans === 'object' ? (
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                      {ans.first && <div className="text-green-600">1st: {ans.first}</div>}
                                      {ans.second && <div className="text-yellow-600">2nd: {ans.second}</div>}
                                      {ans.repulsion && <div className="text-red-600">No: {ans.repulsion}</div>}
                                    </div>
                                  ) : (
                                    <span>{String(ans)}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Result Details</h4>
                            <div className="bg-white p-3 rounded border border-gray-200 text-sm space-y-2">
                              <div>
                                <span className="font-semibold">Scores:</span>
                                <div className="flex gap-2 mt-1">
                                  {item.result?.scores && Object.entries(item.result.scores).map(([k, v]) => (
                                    <span key={k} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{k}: {v as number}</span>
                                  ))}
                                </div>
                              </div>
                              {item.result?.flags && item.result.flags.length > 0 && (
                                <div>
                                  <span className="font-semibold">Flags:</span>
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {item.result.flags.map((f: string) => (
                                      <span key={f} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">{f}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
