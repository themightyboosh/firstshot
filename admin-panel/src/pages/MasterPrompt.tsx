import { useEffect, useState } from 'react';
import { Save, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { globalSettingsApi } from '../lib/api';
import type { GlobalSettingsConfig } from '../lib/types';

export default function MasterPrompt() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [config, setConfig] = useState<GlobalSettingsConfig | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await globalSettingsApi.getConfig();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setSaving(true);
    setError(null);
    try {
      await globalSettingsApi.saveConfig(config);
      setSuccess('Saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Master Prompt</h2>
          <p className="text-gray-500 mt-1">Configure the AI prompt template for generating guidance</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Changes</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Token Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Available Tokens</h4>
            <p className="text-sm text-blue-700 mb-3">
              Use these tokens in your prompt — they'll be replaced with actual values when generating guidance.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="bg-white/60 rounded px-2 py-1">
                <code className="text-xs font-mono text-blue-800">*core-recognition*</code>
                <p className="text-xs text-blue-600 mt-0.5">User's core recognition</p>
              </div>
              <div className="bg-white/60 rounded px-2 py-1">
                <code className="text-xs font-mono text-blue-800">*protective-logic*</code>
                <p className="text-xs text-blue-600 mt-0.5">Protective behavior pattern</p>
              </div>
              <div className="bg-white/60 rounded px-2 py-1">
                <code className="text-xs font-mono text-blue-800">*cost-under-stress*</code>
                <p className="text-xs text-blue-600 mt-0.5">Stress response cost</p>
              </div>
              <div className="bg-white/60 rounded px-2 py-1">
                <code className="text-xs font-mono text-blue-800">*repulsion-disavowal*</code>
                <p className="text-xs text-blue-600 mt-0.5">Avoidance pattern</p>
              </div>
              <div className="bg-white/60 rounded px-2 py-1">
                <code className="text-xs font-mono text-blue-800">*primary*</code>
                <p className="text-xs text-blue-600 mt-0.5">Primary terrain type</p>
              </div>
              <div className="bg-white/60 rounded px-2 py-1">
                <code className="text-xs font-mono text-blue-800">*secondary*</code>
                <p className="text-xs text-blue-600 mt-0.5">Secondary terrain type</p>
              </div>
              <div className="bg-white/60 rounded px-2 py-1">
                <code className="text-xs font-mono text-blue-800">*situation_context*</code>
                <p className="text-xs text-blue-600 mt-0.5">Selected situation details</p>
              </div>
              <div className="bg-white/60 rounded px-2 py-1">
                <code className="text-xs font-mono text-blue-800">*prompt-fragment*</code>
                <p className="text-xs text-blue-600 mt-0.5">Alias for situation_context</p>
              </div>
              <div className="bg-white/60 rounded px-2 py-1">
                <code className="text-xs font-mono text-blue-800">*affect_name*</code>
                <p className="text-xs text-blue-600 mt-0.5">Selected affect name</p>
              </div>
              <div className="bg-white/60 rounded px-2 py-1">
                <code className="text-xs font-mono text-blue-800">*affect_description*</code>
                <p className="text-xs text-blue-600 mt-0.5">Affect description text</p>
              </div>
              <div className="bg-white/60 rounded px-2 py-1">
                <code className="text-xs font-mono text-blue-800">*affect_guidance*</code>
                <p className="text-xs text-blue-600 mt-0.5">Affect interaction guidance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Master Prompt Editor */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Prompt Template</h3>
          <p className="text-sm text-gray-500">This is the full prompt sent to the AI, with tokens replaced by actual values</p>
        </div>
        
        <div className="p-6">
          <textarea
            value={config?.masterPrompt || ''}
            onChange={(e) => setConfig(config ? { ...config, masterPrompt: e.target.value } : null)}
            placeholder="Enter your master prompt template here...

Example:
You are a relationship coach helping someone with the following profile:
- Core Recognition: *core-recognition*
- Protective Logic: *protective-logic*

They are facing this situation: *situation_context*

The person they're interacting with seems: *affect_name* - *affect_description*

Provide guidance in JSON format..."
            rows={20}
            className="w-full border rounded-lg px-4 py-3 text-sm font-mono leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-3">
            The AI response should return valid JSON. The keys in the JSON will become card titles in the results screen.
          </p>
        </div>
      </div>
    </div>
  );
}
