import { useEffect, useState } from 'react';
import { feedbackApi } from '../lib/api';
import type { FeedbackItem } from '../lib/types';
import { Loader2, MessageSquare, Star, RefreshCw, Trash2 } from 'lucide-react';

export default function Feedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await feedbackApi.getAll();
      setFeedback(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFeedback = async () => {
    if (!confirm(`Are you sure you want to delete all ${feedback.length} feedback entries? This cannot be undone.`)) return;
    
    setClearing(true);
    try {
      const result = await feedbackApi.clear();
      setFeedback([]);
      alert(`Successfully deleted ${result.deletedCount} feedback entries.`);
    } catch (err) {
      console.error(err);
      alert('Failed to clear feedback');
    } finally {
      setClearing(false);
    }
  };

  const avgScore = feedback.length 
    ? (feedback.reduce((acc, item) => acc + item.score, 0) / feedback.length).toFixed(1)
    : '0.0';

  if (loading && feedback.length === 0) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">User Feedback</h2>
          <p className="text-gray-500 text-sm sm:text-base">CSAT scores and comments from users.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadFeedback}
            disabled={loading}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleClearFeedback}
            disabled={clearing || feedback.length === 0}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm"
          >
            {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 uppercase">Average CSAT</span>
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{avgScore} <span className="text-sm font-normal text-gray-400">/ 5.0</span></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 uppercase">Total Responses</span>
            <MessageSquare className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{feedback.length}</div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {feedback.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No feedback submitted yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Context</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedback.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-lg font-bold ${item.score >= 4 ? 'text-green-600' : item.score <= 2 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {item.score}
                      </span>
                      <Star className={`w-4 h-4 ml-1 ${item.score >= 4 ? 'text-green-400' : item.score <= 2 ? 'text-red-400' : 'text-yellow-400'} fill-current`} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{item.comment || <span className="text-gray-400 italic">No comment</span>}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.recommendationType && <span className="px-2 py-1 bg-gray-100 rounded text-xs mr-2">{item.recommendationType}</span>}
                    {item.appVersion && <span className="text-xs text-gray-400">v{item.appVersion}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
