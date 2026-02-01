import { useEffect, useState } from 'react';
import { Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { promptElementsApi } from '../lib/api';
import type { PromptElementsConfig } from '../lib/types';

export default function PromptElements() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [config, setConfig] = useState<PromptElementsConfig | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await promptElementsApi.getConfig();
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
      await promptElementsApi.saveConfig(config);
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
          <h2 className="text-3xl font-bold text-gray-800">Prompt Elements</h2>
          <p className="text-gray-500 mt-1">Configure reusable text elements for AI image prompts</p>
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

      {/* Style Prompt Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">In the Style of...</h3>
          <p className="text-sm text-gray-500">This text will be appended to AI image generation prompts</p>
        </div>
        
        <div className="p-6">
          <textarea
            value={config?.stylePrompt || ''}
            onChange={(e) => setConfig(config ? { ...config, stylePrompt: e.target.value } : null)}
            placeholder="e.g., in the style of a soft watercolor painting with muted earth tones, gentle brushstrokes, and a dreamy atmospheric quality..."
            rows={6}
            className="w-full border rounded-lg px-4 py-3 text-sm"
          />
          <p className="text-xs text-gray-400 mt-2">
            This style description will be combined with archetype image descriptions when generating images.
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-1">How it works</h4>
        <p className="text-sm text-blue-700">
          Each archetype has its own "Image Description" field (editable in CAS Configuration → Archetypes tab). 
          When generating images, the archetype's description is combined with this style prompt to create the final AI prompt.
        </p>
      </div>
    </div>
  );
}
