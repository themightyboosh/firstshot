import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { Save, Loader2, PlayCircle } from 'lucide-react';

// Types
interface Option {
  id: string;
  text: string;
  terrain: 'Anxious' | 'Avoidant' | 'Secure' | 'Disorganized';
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

export default function CASConfig() {
  const [config, setConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'archetypes' | 'simulator'>('questions');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Simulator State
  const [simAnswers, setSimAnswers] = useState<Record<string, string>>({});
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const getCasConfig = httpsCallable(functions, 'getCasConfig');
      const result = await getCasConfig();
      setConfig(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updateCasConfig = httpsCallable(functions, 'updateCasConfig');
      await updateCasConfig(config);
      alert('Configuration saved successfully!');
    } catch (err: any) {
      alert(`Error saving: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const runSimulation = async () => {
    try {
      const calculateTerrainScore = httpsCallable(functions, 'calculateTerrainScore');
      const result = await calculateTerrainScore({ answers: simAnswers });
      setSimResult(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Terrain Configuration</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['questions', 'archetypes', 'simulator'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Questions Editor */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {config.questions.map((q: Question, idx: number) => (
            <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between mb-4">
                <span className="text-sm font-bold text-gray-400">Question {idx + 1}</span>
              </div>
              <input
                type="text"
                className="w-full text-lg font-medium border-b border-gray-200 pb-2 mb-4 focus:outline-none focus:border-indigo-500"
                value={q.text}
                onChange={(e) => {
                  const newQuestions = [...config.questions];
                  newQuestions[idx].text = e.target.value;
                  setConfig({ ...config, questions: newQuestions });
                }}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options.map((opt, optIdx) => (
                  <div key={opt.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        opt.terrain === 'Secure' ? 'bg-green-100 text-green-700' :
                        opt.terrain === 'Anxious' ? 'bg-red-100 text-red-700' :
                        opt.terrain === 'Avoidant' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {opt.terrain}
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      className="w-full bg-transparent resize-none text-sm focus:outline-none"
                      value={opt.text}
                      onChange={(e) => {
                        const newQuestions = [...config.questions];
                        newQuestions[idx].options[optIdx].text = e.target.value;
                        setConfig({ ...config, questions: newQuestions });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Archetypes Editor */}
      {activeTab === 'archetypes' && (
        <div className="space-y-6">
          {config.archetypes.map((arch: any, idx: number) => (
            <div key={arch.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-2">{arch.name}</h3>
              <div className="flex space-x-2 text-sm mb-4">
                <span className="text-gray-500">Primary: <b>{arch.primaryTerrain}</b></span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">Secondary: <b>{arch.secondaryTerrain || 'None'}</b></span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Core Recognition</label>
                  <textarea
                    rows={3}
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                    value={arch.profileData.coreRecognition}
                    onChange={(e) => {
                      const newArchs = [...config.archetypes];
                      newArchs[idx].profileData.coreRecognition = e.target.value;
                      setConfig({ ...config, archetypes: newArchs });
                    }}
                  />
                </div>
                {/* Add other fields similarly if needed */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simulator */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold">Simulate Answers</h3>
            {config.questions.map((q: Question) => (
              <div key={q.id} className="bg-white p-4 rounded-lg border">
                <p className="font-medium mb-2">{q.text}</p>
                <div className="space-y-2">
                  {q.options.map(opt => (
                    <label key={opt.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt.id}
                        checked={simAnswers[q.id] === opt.id}
                        onChange={() => setSimAnswers({ ...simAnswers, [q.id]: opt.id })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm">
                        {opt.text} <span className="text-gray-400 text-xs">({opt.terrain})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={runSimulation}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center space-x-2"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Calculate Result</span>
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Result</h3>
            {simResult ? (
              <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-600 sticky top-4">
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Archetype</span>
                  <h2 className="text-2xl font-bold text-indigo-900">{simResult.archetype?.name || 'Unknown'}</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold text-gray-400">Primary</span>
                    <p className="font-medium">{simResult.primaryTerrain}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400">Secondary</span>
                    <p className="font-medium">{simResult.secondaryTerrain || 'None'}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <span className="text-xs font-bold text-gray-400">Scores</span>
                  {Object.entries(simResult.scores).map(([terrain, score]: any) => (
                    <div key={terrain} className="flex items-center justify-between text-sm">
                      <span>{terrain}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${(score / 8) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono w-4 text-right">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {simResult.flags && simResult.flags.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <span className="text-xs font-bold text-yellow-700 block mb-1">System Flags</span>
                    <div className="flex flex-wrap gap-1">
                      {simResult.flags.map((flag: string) => (
                        <span key={flag} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                Select options and run simulation to see results.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
