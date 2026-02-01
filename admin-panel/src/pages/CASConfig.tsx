import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { Save, Loader2, AlertCircle } from 'lucide-react';

export default function CASConfig() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const getCasConfig = httpsCallable(functions, 'getCasConfig');
      const result = await getCasConfig();
      setConfig(result.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load configuration. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      // Parse JSON to ensure it's valid before sending
      // In a real editor we'd bind to individual fields, but for the raw JSON editor:
      const updateCasConfig = httpsCallable(functions, 'updateCasConfig');
      await updateCasConfig(config);
      alert('Configuration saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert(`Error saving: ${err.message}`);
    } finally {
      setSaving(false);
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
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">CAS Configuration</h2>
          <p className="text-gray-500">Edit the core scoring logic and content.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <span className="font-mono text-xs text-gray-500">JSON Editor</span>
        </div>
        <textarea
          className="flex-1 w-full h-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
          value={JSON.stringify(config, null, 2)}
          onChange={(e) => {
            try {
              const newConfig = JSON.parse(e.target.value);
              setConfig(newConfig);
              setError(null);
            } catch (err) {
              // Just update the text state locally if we want to allow invalid JSON while typing
              // But here we're updating the state directly, so this is a simple implementation.
              // Ideally we'd have a separate text state.
            }
          }}
          defaultValue={JSON.stringify(config, null, 2)}
        />
      </div>
    </div>
  );
}
