import { useEffect, useState } from 'react';
import { Loader2, Download, Upload, Trash2, RotateCcw, Plus, Clock } from 'lucide-react';
import { doc, setDoc, getDoc, getDocs, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { CASConfiguration, Situation, Affect, CMSItem, GlobalSettingsConfig } from '../lib/types';

interface SystemBackup {
        id: string;
        name: string;
        createdAt: string;
        description: string;
        data: {
                casConfig: CASConfiguration | null;
                situations: Situation[];
                affects: Affect[];
                cmsItems: CMSItem[];
                globalSettings: GlobalSettingsConfig | null;
        };
}

// ---- Backup API (direct Firestore) ----

async function fetchAllCollections() {
        const [casDoc, gsDoc, sitSnap, affSnap, cmsSnap] = await Promise.all([
                getDoc(doc(db, 'cas_config', 'main')),
                getDoc(doc(db, 'global_settings', 'main')),
                getDocs(collection(db, 'situations')),
                getDocs(collection(db, 'affects')),
                getDocs(collection(db, 'cms_items')),
        ]);

        return {
                casConfig: casDoc.exists() ? (casDoc.data() as CASConfiguration) : null,
                globalSettings: gsDoc.exists() ? (gsDoc.data() as GlobalSettingsConfig) : null,
                situations: sitSnap.docs.map(d => ({ id: d.id, ...d.data() } as Situation)),
                affects: affSnap.docs.map(d => ({ id: d.id, ...d.data() } as Affect)),
                cmsItems: cmsSnap.docs.map(d => ({ id: d.id, ...d.data() } as CMSItem)),
        };
}

async function listBackups(): Promise<SystemBackup[]> {
        const snap = await getDocs(collection(db, 'system_backups'));
        return snap.docs
                .map(d => ({ ...d.data(), id: d.id } as SystemBackup))
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function createBackup(name: string, description: string): Promise<string> {
        const data = await fetchAllCollections();
        const id = `backup_${Date.now()}`;
        const backup: SystemBackup = {
                id,
                name,
                description,
                createdAt: new Date().toISOString(),
                data,
        };
        const sanitized = JSON.parse(JSON.stringify(backup));
        await setDoc(doc(db, 'system_backups', id), sanitized);
        return id;
}

async function restoreBackup(backup: SystemBackup): Promise<void> {
        const { casConfig, globalSettings, situations, affects, cmsItems } = backup.data;

        // Restore CAS config
        if (casConfig) {
                await setDoc(doc(db, 'cas_config', 'main'), JSON.parse(JSON.stringify(casConfig)));
        }

        // Restore global settings
        if (globalSettings) {
                await setDoc(doc(db, 'global_settings', 'main'), JSON.parse(JSON.stringify(globalSettings)));
        }

        // Restore situations — delete existing then write
        const sitSnap = await getDocs(collection(db, 'situations'));
        await Promise.all(sitSnap.docs.map(d => deleteDoc(d.ref)));
        await Promise.all(situations.map(s => {
                const { id, ...rest } = s as Situation & { id: string };
                return setDoc(doc(db, 'situations', id || `sit_${Date.now()}`), JSON.parse(JSON.stringify(rest)));
        }));

        // Restore affects
        const affSnap = await getDocs(collection(db, 'affects'));
        await Promise.all(affSnap.docs.map(d => deleteDoc(d.ref)));
        await Promise.all(affects.map(a => {
                const { id, ...rest } = a;
                return setDoc(doc(db, 'affects', id), JSON.parse(JSON.stringify(rest)));
        }));

        // Restore CMS items
        const cmsSnap = await getDocs(collection(db, 'cms_items'));
        await Promise.all(cmsSnap.docs.map(d => deleteDoc(d.ref)));
        await Promise.all(cmsItems.map(c => {
                const { id, ...rest } = c;
                return setDoc(doc(db, 'cms_items', id), JSON.parse(JSON.stringify(rest)));
        }));
}

async function removeBackup(id: string): Promise<void> {
        await deleteDoc(doc(db, 'system_backups', id));
}

// ---- Component ----

export default function Backups() {
        const [backups, setBackups] = useState<SystemBackup[]>([]);
        const [loading, setLoading] = useState(true);
        const [creating, setCreating] = useState(false);
        const [restoring, setRestoring] = useState<string | null>(null);
        const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
        const [showCreate, setShowCreate] = useState(false);
        const [newName, setNewName] = useState('');
        const [newDesc, setNewDesc] = useState('');

        useEffect(() => { load(); }, []);

        const load = async () => {
                setLoading(true);
                try {
                        setBackups(await listBackups());
                } catch (err) {
                        console.error(err);
                        flash('error', 'Failed to load backups');
                } finally {
                        setLoading(false);
                }
        };

        const flash = (type: 'success' | 'error', text: string) => {
                setMessage({ type, text });
                setTimeout(() => setMessage(null), 4000);
        };

        const handleCreate = async () => {
                if (!newName.trim()) return;
                setCreating(true);
                try {
                        await createBackup(newName.trim(), newDesc.trim());
                        flash('success', 'Backup created!');
                        setShowCreate(false);
                        setNewName('');
                        setNewDesc('');
                        await load();
                } catch (err) {
                        console.error(err);
                        flash('error', 'Failed to create backup');
                } finally {
                        setCreating(false);
                }
        };

        const handleRestore = async (backup: SystemBackup) => {
                if (!confirm(`Restore backup "${backup.name}"?\n\nThis will OVERWRITE all current CAS config, situations, affects, CMS items, and global settings with the backup data. This cannot be undone.`)) return;
                setRestoring(backup.id);
                try {
                        await restoreBackup(backup);
                        flash('success', `Restored "${backup.name}" successfully!`);
                } catch (err) {
                        console.error(err);
                        flash('error', 'Restore failed');
                } finally {
                        setRestoring(null);
                }
        };

        const handleDelete = async (id: string, name: string) => {
                if (!confirm(`Delete backup "${name}"? This cannot be undone.`)) return;
                try {
                        await removeBackup(id);
                        flash('success', 'Backup deleted');
                        await load();
                } catch (err) {
                        console.error(err);
                        flash('error', 'Failed to delete backup');
                }
        };

        const handleExport = (backup: SystemBackup) => {
                const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${backup.name.replace(/\s+/g, '_')}_${backup.createdAt.split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
        };

        const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                        const text = await file.text();
                        const imported = JSON.parse(text) as SystemBackup;
                        if (!imported.data || !imported.name) {
                                flash('error', 'Invalid backup file format');
                                return;
                        }
                        const id = `imported_${Date.now()}`;
                        imported.id = id;
                        imported.name = `[Imported] ${imported.name}`;
                        imported.createdAt = new Date().toISOString();
                        const sanitized = JSON.parse(JSON.stringify(imported));
                        await setDoc(doc(db, 'system_backups', id), sanitized);
                        flash('success', 'Backup imported!');
                        await load();
                } catch (err) {
                        console.error(err);
                        flash('error', 'Failed to import: invalid JSON');
                }
                e.target.value = '';
        };

        const countItems = (b: SystemBackup) => {
                const d = b.data;
                const parts: string[] = [];
                if (d.casConfig) parts.push(`${d.casConfig.questions?.length || 0} questions, ${d.casConfig.archetypes?.length || 0} archetypes`);
                if (d.situations?.length) parts.push(`${d.situations.length} situations`);
                if (d.affects?.length) parts.push(`${d.affects.length} affects`);
                if (d.cmsItems?.length) parts.push(`${d.cmsItems.length} CMS items`);
                if (d.globalSettings) parts.push('global settings');
                return parts.join(' · ');
        };

        if (loading) {
                return (
                        <div className="flex h-full items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                );
        }

        return (
                <div className="space-y-6 max-w-4xl">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                                <div>
                                        <h2 className="text-3xl font-bold text-gray-800">Backups</h2>
                                        <p className="text-gray-500">Snapshot, restore, and manage full system backups.</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                        <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-600">
                                                <Upload className="w-4 h-4" /><span>Import</span>
                                                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                                        </label>
                                        <button
                                                onClick={() => setShowCreate(true)}
                                                className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 font-medium"
                                        >
                                                <Plus className="w-4 h-4" /><span>Create Backup</span>
                                        </button>
                                </div>
                        </div>

                        {/* Message */}
                        {message && (
                                <div className={`px-4 py-3 rounded-lg border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                        {message.text}
                                </div>
                        )}

                        {/* Create Modal */}
                        {showCreate && (
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-200">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4">Create New Backup</h3>
                                        <div className="space-y-4">
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Backup Name</label>
                                                        <input
                                                                type="text"
                                                                value={newName}
                                                                onChange={e => setNewName(e.target.value)}
                                                                placeholder="e.g., Pre-launch snapshot"
                                                                className="w-full border-gray-300 rounded-lg p-2 border text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
                                                        />
                                                </div>
                                                <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                                                        <textarea
                                                                value={newDesc}
                                                                onChange={e => setNewDesc(e.target.value)}
                                                                placeholder="What's in this backup?"
                                                                rows={2}
                                                                className="w-full border-gray-300 rounded-lg p-2 border text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
                                                        />
                                                </div>
                                                <div className="flex justify-end space-x-3">
                                                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">Cancel</button>
                                                        <button
                                                                onClick={handleCreate}
                                                                disabled={creating || !newName.trim()}
                                                                className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                                                        >
                                                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                                <span>{creating ? 'Creating...' : 'Create Backup'}</span>
                                                        </button>
                                                </div>
                                        </div>
                                </div>
                        )}

                        {/* Backup List */}
                        {backups.length === 0 ? (
                                <div className="bg-gray-50 p-12 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-lg font-medium">No backups yet</p>
                                        <p className="text-sm">Create your first backup to save a snapshot of all system content.</p>
                                </div>
                        ) : (
                                <div className="space-y-3">
                                        {backups.map(b => (
                                                <div key={b.id} className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                                        <div className="flex items-start justify-between">
                                                                <div className="flex-1 min-w-0">
                                                                        <h4 className="font-bold text-gray-800 text-lg">{b.name}</h4>
                                                                        {b.description && <p className="text-sm text-gray-500 mt-1">{b.description}</p>}
                                                                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                                                                                <span>{new Date(b.createdAt).toLocaleString()}</span>
                                                                                <span>{countItems(b)}</span>
                                                                        </div>
                                                                </div>
                                                                <div className="flex items-center space-x-2 ml-4 shrink-0">
                                                                        <button
                                                                                onClick={() => handleExport(b)}
                                                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                                                title="Export as JSON"
                                                                        >
                                                                                <Download className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                                onClick={() => handleRestore(b)}
                                                                                disabled={restoring === b.id}
                                                                                className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 text-sm font-medium"
                                                                                title="Restore this backup"
                                                                        >
                                                                                {restoring === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                                                                <span>Restore</span>
                                                                        </button>
                                                                        <button
                                                                                onClick={() => handleDelete(b.id, b.name)}
                                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                                                title="Delete backup"
                                                                        >
                                                                                <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                </div>
                                                        </div>
                                                </div>
                                        ))}
                                </div>
                        )}
                </div>
        );
}
