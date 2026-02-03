import { useEffect, useState, useRef } from 'react';
import { Edit2, Loader2, Image as ImageIcon, Upload, Check, RotateCcw } from 'lucide-react';
import { affectsApi, imageGenerationApi } from '../lib/api';
import type { Affect } from '../lib/types';

export default function Affects() {
  const [affects, setAffects] = useState<Affect[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<Affect | null>(null);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAffects();
  }, []);

  const loadAffects = async () => {
    setLoading(true);
    try {
      const result = await affectsApi.getAll();
      setAffects(result);
    } catch (err) {
      console.error(err);
      setError('Failed to load affects');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all affects to defaults? Custom changes will be lost.')) return;
    setLoading(true);
    try {
      await affectsApi.reset();
      await loadAffects();
      setSuccessMsg('Reset complete');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Failed to reset');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await affectsApi.update(editing);
      setEditing(null);
      await loadAffects();
      setSuccessMsg('Saved successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploadingImage(true);
    try {
      const url = await imageGenerationApi.uploadImage(editing.id, file, 'affect-icons');
      setEditing({ ...editing, iconUrl: url });
    } catch (err) {
      setError('Failed to upload icon');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  if (loading && !editing) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit Affect: {editing.name}</h2>
          <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
        <form onSubmit={handleSave} className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                value={editing.name} 
                onChange={e => setEditing({...editing, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                rows={3}
                value={editing.description} 
                onChange={e => setEditing({...editing, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Interaction Guidance</label>
              <textarea 
                rows={4}
                value={editing.interactionGuidance} 
                onChange={e => setEditing({...editing, interactionGuidance: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Icon</label>
              <div className="flex items-center space-x-4 mt-2">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center overflow-hidden border border-gray-300">
                  {editing.iconUrl ? (
                    <img src={editing.iconUrl} className="w-full h-full object-cover" alt="Icon" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <button 
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-sm font-medium"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload Icon
                </button>
              </div>
            </div>
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Affects</h2>
            <p className="text-gray-500">Manage the 9 core affects.</p>
        </div>
        <button 
            onClick={handleReset} 
            className="flex items-center space-x-2 text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 bg-white"
        >
            <RotateCcw className="w-4 h-4" /> <span>Reset Defaults</span>
        </button>
      </div>
      
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <Check className="w-4 h-4 mr-2" />
          {successMsg}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline float-right">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {affects.map(affect => (
            <div key={affect.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                        {affect.iconUrl ? (
                            <img src={affect.iconUrl} className="w-full h-full object-cover" alt={affect.name} />
                        ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{affect.name}</h3>
                </div>
                <div className="space-y-3 flex-1 mb-4">
                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3" title={affect.description}>{affect.description}</p>
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Guidance</span>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3" title={affect.interactionGuidance}>{affect.interactionGuidance}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setEditing(affect)}
                    className="w-full py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-indigo-600 flex items-center justify-center font-medium text-sm transition-colors"
                >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}
