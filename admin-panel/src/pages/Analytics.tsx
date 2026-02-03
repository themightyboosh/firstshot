import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { responsesApi, feedbackApi } from '../lib/api';
import { Loader2, List, Star, ArrowRight, TrendingUp, Users, MessageSquare } from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResponses: 0,
    totalFeedback: 0,
    avgScore: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [responses, feedback] = await Promise.all([
        responsesApi.getAll(),
        feedbackApi.getAll(),
      ]);
      
      const avgScore = feedback.length 
        ? feedback.reduce((acc, item) => acc + item.score, 0) / feedback.length
        : 0;
      
      setStats({
        totalResponses: responses.length,
        totalFeedback: feedback.length,
        avgScore: Number(avgScore.toFixed(1)),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Analytics</h2>
        <p className="text-gray-500 text-sm sm:text-base">User engagement and feedback insights.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalResponses}</div>
          <p className="text-sm text-gray-500 mt-1">Total Responses</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.avgScore} <span className="text-sm font-normal text-gray-400">/ 5.0</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Average CSAT Score</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalFeedback}</div>
          <p className="text-sm text-gray-500 mt-1">Feedback Submissions</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          to="/analytics/responses"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <List className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">User Responses</h3>
                <p className="text-sm text-gray-500 mt-1">View questionnaire completion history</p>
                <p className="text-xs text-gray-400 mt-2">{stats.totalResponses} total responses</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>

        <Link 
          to="/analytics/feedback"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-yellow-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">User Feedback</h3>
                <p className="text-sm text-gray-500 mt-1">CSAT scores and user comments</p>
                <p className="text-xs text-gray-400 mt-2">
                  {stats.totalFeedback} submissions • {stats.avgScore}/5 avg
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}
