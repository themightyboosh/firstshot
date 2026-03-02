import { useEffect, useState } from 'react';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { casApi } from '../lib/api';
import type { CASConfiguration, ScoringConfig as ScoringConfigType, TerrainType, Archetype } from '../lib/types';

// Default scoring config — must match the server-side DEFAULT_SCORING_CONFIG
const DEFAULT_SCORING_CONFIG: ScoringConfigType = {
        firstChoicePoints: 2,
        secondChoicePoints: 1,
        legacyChoicePoints: 1,
        terrainPriority: { Disorganized: 4, Anxious: 3, Avoidant: 2, Secure: 1 },
        secureThresholdRanked: 12,
        secureThresholdSimple: 6,
        oscillationThresholdRanked: 6,
        oscillationThresholdSimple: 3,
        repulsionFlagThreshold: 4,
        dominanceRatioThreshold: 0.6,
        archetypeMapping: {
                Disorganized: 'mystery_mosaic',
                Secure: 'grounded_navigator',
                Anxious: { Secure: 'emotional_enthusiast', Avoidant: 'passionate_pilgrim', Disorganized: 'heartfelt_defender', Anxious: 'emotional_enthusiast' },
                Avoidant: { Secure: 'lone_wolf', Anxious: 'independent_icon', Disorganized: 'chill_conductor', Avoidant: 'lone_wolf' },
        },
};

const TERRAINS: TerrainType[] = ['Anxious', 'Avoidant', 'Secure', 'Disorganized'];

export default function ScoringConfiguration() {
        const [config, setConfig] = useState<CASConfiguration | null>(null);
        const [sc, setSc] = useState<ScoringConfigType>(DEFAULT_SCORING_CONFIG);
        const [archetypes, setArchetypes] = useState<Archetype[]>([]);
        const [loading, setLoading] = useState(true);
        const [saving, setSaving] = useState(false);
        const [dirty, setDirty] = useState(false);
        const [saveMessage, setSaveMessage] = useState<string | null>(null);

        useEffect(() => { loadConfig(); }, []);

        const loadConfig = async () => {
                setLoading(true);
                try {
                        const cfg = await casApi.getConfig();
                        setConfig(cfg);
                        setArchetypes(cfg.archetypes || []);
                        setSc(cfg.scoringConfig || DEFAULT_SCORING_CONFIG);
                        setDirty(false);
                } catch (err) {
                        console.error(err);
                } finally {
                        setLoading(false);
                }
        };

        const update = (partial: Partial<ScoringConfigType>) => {
                setSc(prev => ({ ...prev, ...partial }));
                setDirty(true);
                setSaveMessage(null);
        };

        const updateMapping = (primary: string, secondary: string | null, archetypeId: string) => {
                const newMapping = { ...sc.archetypeMapping };
                if (secondary === null) {
                        // Direct mapping (Disorganized, Secure)
                        newMapping[primary] = archetypeId;
                } else {
                        const existing = newMapping[primary];
                        const sub = typeof existing === 'object' ? { ...existing } : {};
                        sub[secondary] = archetypeId;
                        newMapping[primary] = sub;
                }
                update({ archetypeMapping: newMapping });
        };

        const save = async () => {
                if (!config) return;
                setSaving(true);
                try {
                        await casApi.updateConfig({ ...config, scoringConfig: sc });
                        setConfig({ ...config, scoringConfig: sc });
                        setDirty(false);
                        setSaveMessage('Saved successfully!');
                        setTimeout(() => setSaveMessage(null), 3000);
                } catch (err) {
                        console.error(err);
                        setSaveMessage('Save failed.');
                } finally {
                        setSaving(false);
                }
        };

        const resetToDefaults = () => {
                if (!confirm('Reset all scoring values to defaults? This won\'t save until you click Save.')) return;
                setSc(DEFAULT_SCORING_CONFIG);
                setDirty(true);
                setSaveMessage(null);
        };

        const getMappingValue = (primary: string, secondary: string): string => {
                const entry = sc.archetypeMapping[primary];
                if (typeof entry === 'string') return entry;
                if (entry && typeof entry === 'object') return entry[secondary] || '';
                return '';
        };

        const isDirectMapping = (primary: string): boolean => {
                return typeof sc.archetypeMapping[primary] === 'string';
        };

        if (loading) {
                return (
                        <div className="flex h-full items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                );
        }

        const archetypeOptions = archetypes.map(a => ({ id: a.id, name: a.name }));

        return (
                <div className="space-y-6 max-w-4xl">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                                <div>
                                        <h2 className="text-3xl font-bold text-gray-800">Scoring Configuration</h2>
                                        <p className="text-gray-500">Edit point weights, override thresholds, and archetype mapping.</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                        {saveMessage && (
                                                <span className={`text-sm font-medium ${saveMessage.includes('fail') ? 'text-red-600' : 'text-green-600'}`}>
                                                        {saveMessage}
                                                </span>
                                        )}
                                        <button onClick={resetToDefaults} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                                                <RotateCcw className="w-4 h-4" /><span>Reset Defaults</span>
                                        </button>
                                        <button
                                                onClick={save}
                                                disabled={saving || !dirty}
                                                className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                                        >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                <span>{dirty ? 'Save Changes' : 'Saved'}</span>
                                        </button>
                                </div>
                        </div>

                        {/* Section 1: Point Weights */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Point Weights</h3>
                                <p className="text-sm text-gray-500 mb-4">How many points each answer rank awards to its terrain.</p>
                                <div className="grid grid-cols-3 gap-6">
                                        <NumberField label="1st Choice Points" sublabel={'"Most like me"'} value={sc.firstChoicePoints} onChange={v => update({ firstChoicePoints: v })} />
                                        <NumberField label="2nd Choice Points" sublabel={'"Next most like me"'} value={sc.secondChoicePoints} onChange={v => update({ secondChoicePoints: v })} />
                                        <NumberField label="Legacy Choice Points" sublabel="Single-answer mode" value={sc.legacyChoicePoints} onChange={v => update({ legacyChoicePoints: v })} />
                                </div>
                        </div>

                        {/* Section 2: Tie-Breaking Priority */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Tie-Breaking Priority</h3>
                                <p className="text-sm text-gray-500 mb-4">When two terrains have the same score, the higher priority terrain wins. Higher number = higher priority.</p>
                                <div className="grid grid-cols-4 gap-6">
                                        {TERRAINS.map(t => (
                                                <NumberField
                                                        key={t}
                                                        label={t}
                                                        value={sc.terrainPriority[t]}
                                                        onChange={v => update({ terrainPriority: { ...sc.terrainPriority, [t]: v } })}
                                                />
                                        ))}
                                </div>
                        </div>

                        {/* Section 3: Override Thresholds */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Override Thresholds</h3>
                                <p className="text-sm text-gray-500 mb-4">Thresholds that trigger special flags and overrides in the scoring algorithm.</p>

                                <div className="space-y-6">
                                        <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Secure Confirmation</h4>
                                                <p className="text-xs text-gray-500 mb-3">If Secure score reaches this threshold, the "confirmed_secure" flag is set.</p>
                                                <div className="grid grid-cols-2 gap-6">
                                                        <NumberField label="Ranked Mode Threshold" sublabel="V2 ranked answers" value={sc.secureThresholdRanked} onChange={v => update({ secureThresholdRanked: v })} />
                                                        <NumberField label="Simple Mode Threshold" sublabel="Legacy single-choice" value={sc.secureThresholdSimple} onChange={v => update({ secureThresholdSimple: v })} />
                                                </div>
                                        </div>

                                        <hr />

                                        <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Disorganized Override (Hidden Oscillation)</h4>
                                                <p className="text-xs text-gray-500 mb-3">If both Anxious AND Avoidant are ≥ this threshold, primary terrain is forced to Disorganized.</p>
                                                <div className="grid grid-cols-2 gap-6">
                                                        <NumberField label="Ranked Mode Threshold" value={sc.oscillationThresholdRanked} onChange={v => update({ oscillationThresholdRanked: v })} />
                                                        <NumberField label="Simple Mode Threshold" value={sc.oscillationThresholdSimple} onChange={v => update({ oscillationThresholdSimple: v })} />
                                                </div>
                                        </div>

                                        <hr />

                                        <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Repulsion Flag</h4>
                                                        <p className="text-xs text-gray-500 mb-3">If any terrain's repulsion count ≥ this, a "strong_repulsion" flag is set.</p>
                                                        <NumberField label="Repulsion Threshold" value={sc.repulsionFlagThreshold} onChange={v => update({ repulsionFlagThreshold: v })} />
                                                </div>
                                                <div>
                                                        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Consistency Check</h4>
                                                        <p className="text-xs text-gray-500 mb-3">If the dominant terrain's score ratio ≥ this value, a "high_consistency" flag is set.</p>
                                                        <NumberField label="Dominance Ratio" value={sc.dominanceRatioThreshold} onChange={v => update({ dominanceRatioThreshold: v })} step={0.05} />
                                                </div>
                                        </div>
                                </div>
                        </div>

                        {/* Section 4: Archetype Mapping Table */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Archetype Mapping Table</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                        Which archetype is assigned based on primary + secondary terrain. Some terrains (Disorganized, Secure) map to a single archetype regardless of secondary.
                                </p>

                                <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                                <thead>
                                                        <tr className="border-b">
                                                                <th className="text-left py-3 pr-4 font-semibold text-gray-700">Primary ↓ / Secondary →</th>
                                                                {TERRAINS.map(t => (
                                                                        <th key={t} className="text-center py-3 px-2 font-semibold text-gray-700">{t}</th>
                                                                ))}
                                                        </tr>
                                                </thead>
                                                <tbody>
                                                        {TERRAINS.map(primary => {
                                                                const direct = isDirectMapping(primary);
                                                                return (
                                                                        <tr key={primary} className="border-b last:border-0">
                                                                                <td className="py-3 pr-4 font-medium text-gray-800">{primary}</td>
                                                                                {direct ? (
                                                                                        <td colSpan={4} className="py-3 px-2">
                                                                                                <div className="flex items-center space-x-2">
                                                                                                        <span className="text-xs text-gray-400 whitespace-nowrap">Any secondary →</span>
                                                                                                        <select
                                                                                                                value={typeof sc.archetypeMapping[primary] === 'string' ? sc.archetypeMapping[primary] as string : ''}
                                                                                                                onChange={e => updateMapping(primary, null, e.target.value)}
                                                                                                                className="w-full border-gray-300 rounded-lg p-2 border text-sm"
                                                                                                        >
                                                                                                                <option value="">— Select —</option>
                                                                                                                {archetypeOptions.map(a => (
                                                                                                                        <option key={a.id} value={a.id}>{a.name}</option>
                                                                                                                ))}
                                                                                                        </select>
                                                                                                </div>
                                                                                        </td>
                                                                                ) : (
                                                                                        TERRAINS.map(secondary => (
                                                                                                <td key={secondary} className="py-3 px-2">
                                                                                                        <select
                                                                                                                value={getMappingValue(primary, secondary)}
                                                                                                                onChange={e => updateMapping(primary, secondary, e.target.value)}
                                                                                                                className="w-full border-gray-300 rounded-lg p-2 border text-sm"
                                                                                                        >
                                                                                                                <option value="">— Select —</option>
                                                                                                                {archetypeOptions.map(a => (
                                                                                                                        <option key={a.id} value={a.id}>{a.name}</option>
                                                                                                                ))}
                                                                                                        </select>
                                                                                                </td>
                                                                                        ))
                                                                                )}
                                                                        </tr>
                                                                );
                                                        })}
                                                </tbody>
                                        </table>
                                </div>

                                <div className="mt-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                        <p className="text-xs text-amber-700">
                                                <strong>Tip:</strong> Disorganized and Secure use "direct mapping" — they always resolve to one archetype regardless of secondary terrain.
                                                Anxious and Avoidant use the full matrix. To change a terrain between direct and matrix mapping, edit the archetype data directly.
                                        </p>
                                </div>
                        </div>

                        {/* Bottom save bar for long pages */}
                        {dirty && (
                                <div className="sticky bottom-4 bg-indigo-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between">
                                        <span className="font-medium">You have unsaved changes</span>
                                        <button
                                                onClick={save}
                                                disabled={saving}
                                                className="flex items-center space-x-2 bg-white text-indigo-600 px-5 py-2 rounded-lg font-bold hover:bg-indigo-50 disabled:opacity-50"
                                        >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                <span>Save Now</span>
                                        </button>
                                </div>
                        )}
                </div>
        );
}

/** Reusable number input field */
function NumberField({ label, sublabel, value, onChange, step = 1 }: {
        label: string;
        sublabel?: string;
        value: number;
        onChange: (v: number) => void;
        step?: number;
}) {
        return (
                <div>
                        <label className="block text-sm font-medium text-gray-700">{label}</label>
                        {sublabel && <span className="text-xs text-gray-400">{sublabel}</span>}
                        <input
                                type="number"
                                step={step}
                                value={value}
                                onChange={e => onChange(parseFloat(e.target.value) || 0)}
                                className="mt-1 w-full border-gray-300 rounded-lg p-2 border text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
                        />
                </div>
        );
}
