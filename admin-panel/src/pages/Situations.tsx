import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon } from 'lucide-react';

export default function Situations() {
  const [situations, setSituations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null); // null means list view, object means edit mode (empty object for new)

  useEffect(() => {
    loadSituations();
  }, []);

  const loadSituations = async () => {
    setLoading(true);
    try {
      const getSituations = httpsCallable(functions, 'getSituations');
      const result = await getSituations();
      setSituations(result.data as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this situation?')) return;
    try {
      const deleteSituation = httpsCallable(functions, 'deleteSituation');
      await deleteSituation({ id });
      await loadSituations();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      if (editing.id) {
        const updateSituation = httpsCallable(functions, 'updateSituation');
        await updateSituation(editing);
      } else {
        const createSituation = httpsCallable(functions, 'createSituation');
        await createSituation(editing);
      }
      setEditing(null);
      loadSituations();
    } catch (err) {
      alert('Failed to save');
    }
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
          <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={editing.name || ''}
              onChange={e => setEditing({ ...editing, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Short Description</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={editing.shortDescription || ''}
              onChange={e => setEditing({ ...editing, shortDescription: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Long Description</label>
            <textarea
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={editing.longDescription || ''}
              onChange={e => setEditing({ ...editing, longDescription: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prompt Fragment</label>
            <textarea
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              value={editing.promptFragment || ''}
              onChange={e => setEditing({ ...editing, promptFragment: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <div className="flex space-x-2">
              <input
                type="url"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                value={editing.squarePngUrl || ''}
                onChange={e => setEditing({ ...editing, squarePngUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Situation
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
          <h2 className="text-3xl font-bold text-gray-800">Situations</h2>
          <p className="text-gray-500">Manage encounter contexts.</p>
        </div>
        <button
          onClick={() => setEditing({})}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Situation</span>
        </button>
      </div>

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
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(situation.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
