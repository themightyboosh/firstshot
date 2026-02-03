import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon, Sparkles, Upload, Check, Download, Info, X } from 'lucide-react';
import { situationsApi, imageGenerationApi, globalSettingsApi } from '../lib/api';
import type { Situation } from '../lib/types';
import { ImageGenerationPreview } from '../components/ImageGenerationPreview';

type EditingSituation = Partial<Situation> & { id?: string };

export default function Situations() {
  const [situations, setSituations] = useState<Situation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingSituation | null>(null);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  
  // Image Generation State
  const [stylePrompt, setStylePrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImageJobId, setCurrentImageJobId] = useState<string | undefined>();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSituations();
    loadStylePrompt();
  }, []);

  const loadStylePrompt = async () => {
    try {
      const config = await globalSettingsApi.getConfig();
      setStylePrompt(config.stylePrompt);
    } catch (err) {
      console.error('Failed to load style prompt', err);
    }
  };

  const loadSituations = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await situationsApi.getAll();
      setSituations(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load situations');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(situations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `situations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessMsg('Situations exported successfully');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported: Situation[] = JSON.parse(text);
      
      if (!Array.isArray(imported)) throw new Error('Invalid format: expected array of situations');

      setLoading(true);
      setError(null);
      setSuccessMsg('Importing situations...');
      
      let updatedCount = 0;
      let createdCount = 0;

      // Current situations map for quick lookup by name (case-insensitive)
      const existingMap = new Map(situations.map(s => [s.name.toLowerCase().trim(), s]));

      for (const item of imported) {
        // Basic validation
        if (!item.name) continue;

        const existing = existingMap.get(item.name.toLowerCase().trim());
        
        if (existing && existing.id) {
          // Update existing situation
          await situationsApi.update({
            ...item,
            id: existing.id // Preserve ID
          });
          updatedCount++;
        } else {
          // Create new situation
          const { id, ...newItem } = item; // Remove ID to let backend generate new one
          await situationsApi.create(newItem);
          createdCount++;
        }
      }

      await loadSituations();
      setSuccessMsg(`Import complete: ${createdCount} created, ${updatedCount} updated.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
      setError('Failed to import: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this situation?')) return;
    try {
      await situationsApi.delete(id);
      await loadSituations();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      setError(message);
      alert(message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing?.id) return;

    setUploadingImage(true);
    try {
      const url = await imageGenerationApi.uploadImage(editing.id, file, 'situation-images');
      updateField('squarePngUrl', url);
      setSuccessMsg('Image uploaded successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleClearQueue = async () => {
    if (!confirm('Are you sure you want to clear the entire image generation queue? This will cancel all pending jobs.')) return;
    try {
      const result = await imageGenerationApi.clearQueue();
      setSuccessMsg(`Queue cleared. ${result.count} jobs removed.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Failed to clear queue');
    }
  };

  const handleGenerateImage = async () => {
    if (!editing || !editing.id || !editing.name) return;
    if (!editing.imageDescription) {
      setError('Please provide an image description first');
      return;
    }

    setGeneratingImage(true);
    setError(null);
    
    // Clear the old image immediately so user knows generation is starting
    updateField('squarePngUrl', undefined);
    
    try {
      const result = await imageGenerationApi.generateSituationImage(
        editing.id,
        editing.name,
        editing.imageDescription,
        stylePrompt
      );

      // Set the job ID - the ImageGenerationPreview component handles the subscription
      setCurrentImageJobId(result.jobId);
      setSuccessMsg('Image generation started...');

      // Trigger processing
      imageGenerationApi.triggerJobProcessing(result.jobId).catch(err => {
        console.error('Trigger processing failed:', err);
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start generation');
      setGeneratingImage(false);
    }
  };

  const handleImageGenerated = (imageUrl: string) => {
    updateField('squarePngUrl', imageUrl);
    setCurrentImageJobId(undefined);
    setGeneratingImage(false);
    setSuccessMsg('Image generated successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
    // Refresh the main list since the backend auto-saved the image
    loadSituations();
  };

  const handleImageGenerationError = (errorMsg: string) => {
    setError(`Image generation failed: ${errorMsg}`);
    setCurrentImageJobId(undefined);
    setGeneratingImage(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    // Validate required fields
    if (!editing.name?.trim()) {
      alert('Name is required');
      return;
    }
    if (!editing.shortDescription?.trim()) {
      alert('Short description is required');
      return;
    }
    if (!editing.longDescription?.trim()) {
      alert('Long description is required');
      return;
    }
    if (!editing.promptFragment?.trim()) {
      alert('Prompt fragment is required');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      if (editing.id) {
        await situationsApi.update(editing as Situation);
      } else {
        await situationsApi.create({
          name: editing.name,
          shortDescription: editing.shortDescription,
          longDescription: editing.longDescription,
          promptFragment: editing.promptFragment,
          squarePngUrl: editing.squarePngUrl || '',
        });
      }
      setEditing(null);
      await loadSituations();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof EditingSituation>(field: K, value: EditingSituation[K]) => {
    if (!editing) return;
    setEditing({ ...editing, [field]: value });
  };

  if (loading && !editing) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{editing.id ? 'Edit Situation' : 'New Situation'}</h2>
          <button 
            onClick={() => setEditing(null)} 
            className="text-gray-500 hover:text-gray-700"
            disabled={saving}
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={editing.name || ''}
              onChange={e => updateField('name', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Short Description</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={editing.shortDescription || ''}
              onChange={e => updateField('shortDescription', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Long Description</label>
            <textarea
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={editing.longDescription || ''}
              onChange={e => updateField('longDescription', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">AI Scenario Context</label>
            <textarea
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={editing.promptFragment || ''}
              onChange={e => updateField('promptFragment', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <div className="flex items-start space-x-4 mt-1">
              <ImageGenerationPreview
                imageUrl={editing.squarePngUrl}
                jobId={currentImageJobId}
                onImageGenerated={handleImageGenerated}
                onError={handleImageGenerationError}
                size="md"
              />
              
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Image Description (for AI)</label>
                  <textarea
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                    value={editing.imageDescription || ''}
                    onChange={e => updateField('imageDescription', e.target.value)}
                    placeholder="Describe the situation scene..."
                  />
                </div>

                <div className="flex space-x-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage || generatingImage || !editing.id}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center disabled:opacity-50"
                  >
                    {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <Upload className="w-3 h-3 mr-1"/>}
                    Upload
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generatingImage || !editing.id || !editing.imageDescription}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-sm hover:bg-indigo-100 flex items-center disabled:opacity-50"
                  >
                    {generatingImage ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <Sparkles className="w-3 h-3 mr-1"/>}
                    Generate with AI
                  </button>
                </div>
                {!editing.id && <p className="text-xs text-amber-600">Save situation first to enable image tools.</p>}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Situation'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Situations</h2>
          <p className="text-gray-500 text-sm sm:text-base">Manage encounter contexts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowSchemaModal(true)}
            className="flex items-center justify-center text-gray-500 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-100"
            title="View Import Schema"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            disabled={loading}
            className="flex items-center space-x-1 sm:space-x-2 border border-gray-300 bg-white text-gray-700 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
            title="Import JSON"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={handleExport}
            disabled={loading || situations.length === 0}
            className="flex items-center space-x-1 sm:space-x-2 border border-gray-300 bg-white text-gray-700 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
            title="Export JSON"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setEditing({})}
            className="flex items-center space-x-1 sm:space-x-2 bg-indigo-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-indigo-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Situation</span>
          </button>
          <button
            onClick={handleClearQueue}
            className="flex items-center space-x-1 sm:space-x-2 bg-red-100 text-red-700 border border-red-200 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-red-200 text-sm"
            title="Clear Image Queue"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Queue</span>
          </button>
        </div>
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
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {situations.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
          No situations yet. Click "Add Situation" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {situations.map((situation) => (
            <div key={situation.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="h-48 bg-gray-100 relative">
                 {situation.squarePngUrl ? (
                   <img src={situation.squarePngUrl} alt={situation.name} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">
                     <ImageIcon className="w-12 h-12" />
                   </div>
                 )}
              </div>
              <div className="p-4 flex-1">
                <h3 className="font-bold text-lg mb-1">{situation.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{situation.shortDescription}</p>
              </div>
              <div className="p-4 border-t bg-gray-50 flex justify-end space-x-2">
                <button
                  onClick={() => setEditing(situation)}
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => situation.id && handleDelete(situation.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSchemaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative">
            <button 
              onClick={() => setShowSchemaModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold mb-4">Import Schema</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your JSON file should contain an array of situation objects with the following structure:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border overflow-auto max-h-[60vh]">
              <pre className="text-xs sm:text-sm font-mono text-gray-700 whitespace-pre-wrap select-all">
{JSON.stringify([
  {
    "name": "Situation Name (Required, Unique Key)",
    "shortDescription": "Brief summary (Required)",
    "longDescription": "Full details (Required)",
    "promptFragment": "AI prompt context (Required)",
    "squarePngUrl": "https://... (Optional)",
    "imageDescription": "For AI generation (Optional)"
  }
], null, 2)}
              </pre>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSchemaModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
