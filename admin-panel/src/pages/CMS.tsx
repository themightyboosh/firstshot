import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon, Sparkles, Upload, Check } from 'lucide-react';
import { cmsApi, imageGenerationApi, globalSettingsApi } from '../lib/api';
import type { CMSItem } from '../lib/types';
import { ImageGenerationPreview } from '../components/ImageGenerationPreview';

type EditingCMSItem = Partial<CMSItem>;

export default function CMS() {
  const [items, setItems] = useState<CMSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingCMSItem | null>(null);
  
  // Image Generation State
  const [stylePrompt, setStylePrompt] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImageJobId, setCurrentImageJobId] = useState<string | undefined>();
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadItems();
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

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cmsApi.getAll();
      setItems(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load CMS items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await cmsApi.delete(id);
      await loadItems();
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing?.id) return;

    setUploadingImage(true);
    try {
      const url = await imageGenerationApi.uploadImage(editing.id, file, 'cms-images');
      setEditing({ ...editing, imageUrl: url });
      setSuccessMsg('Image uploaded successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleGenerateImage = async () => {
    if (!editing || !editing.id || !editing.title) return;
    if (!editing.imageDescription) {
      setError('Please provide an image description first');
      return;
    }

    setGeneratingImage(true);
    setError(null);
    
    // Clear the old image immediately so user knows generation is starting
    setEditing(prev => prev ? { ...prev, imageUrl: undefined } : null);
    
    try {
      const result = await imageGenerationApi.generateCMSImage(
        editing.id,
        editing.title,
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
      setError('Failed to start generation');
      setGeneratingImage(false);
    }
  };

  const handleImageGenerated = (imageUrl: string) => {
    setEditing(prev => prev ? { ...prev, imageUrl } : null);
    setCurrentImageJobId(undefined);
    setGeneratingImage(false);
    setSuccessMsg('Image generated successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
    loadItems(); // Refresh list
  };

  const handleImageGenerationError = (errorMsg: string) => {
    setError(`Image generation failed: ${errorMsg}`);
    setCurrentImageJobId(undefined);
    setGeneratingImage(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    if (!editing.id?.trim()) {
      setError('ID is required');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(editing.id)) {
      setError('ID must be snake_case (lowercase letters, numbers, underscores only)');
      return;
    }
    if (!editing.title?.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      // Check if updating existing or creating new
      const isNew = !items.find(i => i.id === editing.id);
      
      if (isNew) {
        await cmsApi.create(editing);
      } else {
        await cmsApi.update(editing);
      }
      
      setEditing(null);
      await loadItems();
      setSuccessMsg('Saved successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
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
          <h2 className="text-2xl font-bold">{items.find(i => i.id === editing.id) ? 'Edit Item' : 'New Item'}</h2>
          <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 bg-white p-6 rounded-xl border shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name ID <span className="text-gray-400 text-xs">(snake_case, unique)</span>
            </label>
            <input 
              value={editing.id || ''} 
              onChange={e => setEditing({...editing, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')})}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 font-mono bg-gray-50"
              required
              disabled={!!items.find(i => i.id === editing.id)} // Disable if editing existing
              placeholder="e.g. hero_banner, about_section"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input 
              value={editing.title || ''} 
              onChange={e => setEditing({...editing, title: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Copy</label>
            <textarea 
              rows={3}
              value={editing.copy || ''} 
              onChange={e => setEditing({...editing, copy: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Button Text</label>
              <input 
                value={editing.buttonText || ''} 
                onChange={e => setEditing({...editing, buttonText: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Button NL Action</label>
              <input 
                value={editing.buttonAction || ''} 
                onChange={e => setEditing({...editing, buttonAction: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                placeholder="e.g. Navigate to About Page"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Internal Description</label>
            <textarea 
              rows={2}
              value={editing.description || ''} 
              onChange={e => setEditing({...editing, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1 text-sm text-gray-600"
              placeholder="Notes for admin use..."
            />
          </div>

          <div className="border-t pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <div className="flex items-start space-x-4">
              <ImageGenerationPreview
                imageUrl={editing.imageUrl}
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
                    onChange={e => setEditing({...editing, imageDescription: e.target.value})}
                    placeholder="Describe image for AI generation..."
                  />
                </div>
                <div className="flex space-x-2">
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <button 
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center disabled:opacity-50"
                    disabled={uploadingImage || generatingImage || !editing.id}
                  >
                    {uploadingImage ? <Loader2 className="animate-spin w-3 h-3 mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
                    Upload
                  </button>
                  <button 
                    type="button"
                    onClick={handleGenerateImage}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-sm hover:bg-indigo-100 flex items-center disabled:opacity-50"
                    disabled={generatingImage || !editing.id || !editing.imageDescription}
                  >
                    {generatingImage ? <Loader2 className="animate-spin w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    Generate
                  </button>
                </div>
                {!editing.id && <p className="text-xs text-amber-600">Enter Name ID first to enable image tools.</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={saving} 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 flex items-center"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Item
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
            <h2 className="text-3xl font-bold text-gray-800">CMS Content</h2>
            <p className="text-gray-500">Manage static content blocks.</p>
        </div>
        <button 
            onClick={() => setEditing({})} 
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
            <Plus className="w-4 h-4" /> <span>Add Content</span>
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

      {items.length === 0 ? (
        <div className="bg-gray-50 p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
          No content items yet. Click "Add Content" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <div className="text-xs text-gray-500 font-mono bg-gray-50 px-1 py-0.5 rounded inline-block mt-1">
                    {item.id}
                  </div>
                  {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setEditing(item)}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
