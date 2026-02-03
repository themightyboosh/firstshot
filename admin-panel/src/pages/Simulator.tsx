import { useEffect, useState } from 'react';
import { Loader2, Shuffle, RefreshCw, BarChart3, Bot } from 'lucide-react';
import { casApi, situationsApi, affectsApi, globalSettingsApi, geminiApi } from '../lib/api';
import type { CASConfiguration, Question, ScoringResult, TerrainType, RankedAnswer, Situation, Affect } from '../lib/types';
import { defaultConfig } from '../lib/defaultConfig';

export default function Simulator() {
  const [config, setConfig] = useState<CASConfiguration | null>(null);
  const [situations, setSituations] = useState<Situation[]>([]);
  const [affects, setAffects] = useState<Affect[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simulator State
  const [simRankedAnswers, setSimRankedAnswers] = useState<Record<string, Partial<RankedAnswer>>>({});
  const [simResult, setSimResult] = useState<ScoringResult | null>(null);
  const [selectedSituationId, setSelectedSituationId] = useState<string>('');
  const [selectedAffectId, setSelectedAffectId] = useState<string>('');
  const [masterPromptTemplate, setMasterPromptTemplate] = useState('');
  const [geminiResult, setGeminiResult] = useState<string | null>(null);
  const [runningGemini, setRunningGemini] = useState(false);
  const [showGeminiModal, setShowGeminiModal] = useState(false);

  const runGemini = async () => {
    if (!generatedPrompt) return;
    setRunningGemini(true);
    setGeminiResult(null);
    try {
        const result = await geminiApi.runPrompt(generatedPrompt);
        setGeminiResult(result.text);
        setShowGeminiModal(true);
    } catch (err) {
        setError('Failed to run Gemini');
    } finally {
        setRunningGemini(false);
    }
  };

  const rankLabels: Record<keyof RankedAnswer, { label: string; color: string }> = {
    first: { label: '1st', color: 'bg-green-500 text-white' },
    second: { label: '2nd', color: 'bg-yellow-500 text-white' },
    repulsion: { label: 'Least', color: 'bg-red-500 text-white' },
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [configResult, situationsResult, affectsResult, promptConfig] = await Promise.all([
        casApi.getConfig(),
        situationsApi.getAll(),
        affectsApi.getAll(),
        globalSettingsApi.getConfig()
      ]);

      if (!configResult.questions || configResult.questions.length === 0 || 
          configResult.questions[0]?.text?.includes('Please Edit')) {
        setConfig(defaultConfig);
      } else {
        setConfig(configResult);
      }
      
      setSituations(situationsResult);
      setAffects(affectsResult);
      setMasterPromptTemplate(promptConfig.masterPrompt || '');
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Using default config.');
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const setRankedSelection = (questionId: string, rank: keyof RankedAnswer, optionId: string) => {
    const current = simRankedAnswers[questionId] || {};
    const updated: Partial<RankedAnswer> = { ...current };
    
    // Remove if already selected elsewhere in this question
    if (updated.first === optionId) updated.first = undefined;
    if (updated.second === optionId) updated.second = undefined;
    if (updated.repulsion === optionId) updated.repulsion = undefined;
    
    updated[rank] = optionId;
    setSimRankedAnswers({ ...simRankedAnswers, [questionId]: updated });
  };

  const getRankForOption = (questionId: string, optionId: string): keyof RankedAnswer | null => {
    const answer = simRankedAnswers[questionId];
    if (!answer) return null;
    if (answer.first === optionId) return 'first';
    if (answer.second === optionId) return 'second';
    if (answer.repulsion === optionId) return 'repulsion';
    return null;
  };

  const runSimulation = async (answersOverride?: Record<string, RankedAnswer>) => {
    setSimulating(true);
    try {
      const answers = answersOverride || Object.fromEntries(
        Object.entries(simRankedAnswers)
          .filter(([, ans]) => ans.first && ans.second && ans.repulsion)
          .map(([qId, ans]) => [qId, ans as RankedAnswer])
      );
      
      const result = await casApi.calculateScore(answers);
      setSimResult(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const randomizeAndCalculate = async () => {
    if (!config) return;
    
    // Randomize Answers
    const randomAnswers: Record<string, RankedAnswer> = {};
    config.questions.forEach(q => {
      const indices = [0, 1, 2, 3];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      randomAnswers[q.id] = {
        first: q.options[indices[0]].id,
        second: q.options[indices[1]].id,
        repulsion: q.options[indices[2]].id,
      };
    });
    setSimRankedAnswers(randomAnswers);

    // Randomize Situation
    if (situations.length > 0) {
      const randomSituation = situations[Math.floor(Math.random() * situations.length)];
      setSelectedSituationId(randomSituation.id || '');
    }

    // Randomize Affect
    if (affects.length > 0) {
      const randomAffect = affects[Math.floor(Math.random() * affects.length)];
      setSelectedAffectId(randomAffect.id);
    }
    
    await runSimulation(randomAnswers);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!config) return <div className="p-8">Config failed to load.</div>;

  const selectedSituation = situations.find(s => s.id === selectedSituationId);
  const selectedAffect = affects.find(a => a.id === selectedAffectId);

  const generateMasterPrompt = () => {
    if (!masterPromptTemplate) {
        console.log('Master prompt generation skipped: Missing template');
        return null;
    }
    if (!simResult?.archetype) {
        console.log('Master prompt generation skipped: Missing archetype result');
        return null;
    }
    if (!selectedSituation) {
        console.log('Master prompt generation skipped: Missing selected situation');
        return null;
    }
    if (!selectedAffect) {
        console.log('Master prompt generation skipped: Missing selected affect');
        return null;
    }
    
    let prompt = masterPromptTemplate;
    const arch = simResult.archetype;
    
    prompt = prompt.replace(/\*core-recognition\*/g, arch.profileData.coreRecognition);
    prompt = prompt.replace(/\*protective-logic\*/g, arch.profileData.protectiveLogic);
    prompt = prompt.replace(/\*cost-under-stress\*/g, arch.profileData.costUnderStress);
    prompt = prompt.replace(/\*repulsion-disavowal\*/g, arch.profileData.repulsionDisavowal);
    prompt = prompt.replace(/\*primary\*/g, arch.primaryTerrain);
    prompt = prompt.replace(/\*secondary\*/g, arch.secondaryTerrain || 'None');
    
    prompt = prompt.replace(/\*prompt-fragment\*/g, selectedSituation.promptFragment);
    prompt = prompt.replace(/\*situation_context\*/g, selectedSituation.promptFragment);
    
    prompt = prompt.replace(/\*affect_name\*/g, selectedAffect.name);
    prompt = prompt.replace(/\*affect_description\*/g, selectedAffect.description);
    prompt = prompt.replace(/\*affect_guidance\*/g, selectedAffect.interactionGuidance);
    
    return prompt;
  };

  const generatedPrompt = generateMasterPrompt();

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Simulator</h2>
          <p className="text-gray-500">Test scoring logic with randomized inputs.</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Data</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2">
          {/* Controls */}
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
            <h3 className="text-lg font-bold">Simulation Controls</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Situation</label>
                <select 
                  value={selectedSituationId}
                  onChange={(e) => setSelectedSituationId(e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-2 border"
                >
                  <option value="">Select Situation...</option>
                  {situations.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Affect</label>
                <select 
                  value={selectedAffectId}
                  onChange={(e) => setSelectedAffectId(e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-2 border"
                >
                  <option value="">Select Affect...</option>
                  {affects.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={randomizeAndCalculate}
                disabled={simulating}
                className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-bold"
              >
                {simulating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shuffle className="w-5 h-5" />}
                <span>Randomize Everything & Calculate</span>
              </button>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Answer Selection</h3>
              <div className="text-xs space-x-2">
                 <span className="px-2 py-0.5 bg-green-500 text-white rounded">1st (+2)</span>
                 <span className="px-2 py-0.5 bg-yellow-500 text-white rounded">2nd (+1)</span>
                 <span className="px-2 py-0.5 bg-red-500 text-white rounded">Least (Repulsion)</span>
              </div>
            </div>
            
            {config.questions.map((q: Question) => (
              <div key={q.id} className="bg-white p-4 rounded-lg border shadow-sm">
                <p className="font-medium mb-3 text-gray-800">{q.text}</p>
                <div className="space-y-2">
                  {q.options.map(opt => {
                    const currentRank = getRankForOption(q.id, opt.id);
                    const ranks: (keyof RankedAnswer)[] = ['first', 'second', 'repulsion'];
                    const nextRank = currentRank 
                      ? ranks[(ranks.indexOf(currentRank) + 1) % ranks.length]
                      : 'first';

                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (currentRank) {
                            if (currentRank === 'repulsion') {
                              const updated = { ...simRankedAnswers[q.id] };
                              delete updated.repulsion;
                              setSimRankedAnswers({ ...simRankedAnswers, [q.id]: updated });
                            } else {
                              setRankedSelection(q.id, nextRank, opt.id);
                            }
                          } else {
                            setRankedSelection(q.id, 'first', opt.id);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                          currentRank 
                            ? 'border-indigo-300 bg-indigo-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm text-gray-700">{opt.text}</span>
                        {currentRank && (
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide shadow-sm ${rankLabels[currentRank].color}`}>
                            {rankLabels[currentRank].label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="pb-10">
             <button
                onClick={() => runSimulation()}
                disabled={simulating}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 text-lg shadow-md"
              >
                {simulating ? 'Calculating...' : 'Calculate Result'}
              </button>
          </div>
        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-1 overflow-y-auto">
          {simResult ? (
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-600 sticky top-0 space-y-6">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resulting Archetype</span>
                <h2 className="text-3xl font-bold text-indigo-900 mt-1">{simResult.archetype?.name || 'Unknown'}</h2>
              </div>

              {simResult.archetype?.imageUrl && (
                 <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                    <img src={simResult.archetype.imageUrl} className="w-full h-full object-cover" alt="Archetype" />
                 </div>
              )}

              {/* Context Display */}
              {(selectedSituation || selectedAffect) && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                    <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-2">Context</h4>
                    {selectedSituation && (
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Situation</span>
                            <p className="font-medium text-gray-800">{selectedSituation.name}</p>
                            {selectedSituation.squarePngUrl && (
                                <img src={selectedSituation.squarePngUrl} className="w-16 h-16 object-cover rounded mt-1 border" alt="Situation" />
                            )}
                        </div>
                    )}
                    {selectedAffect && (
                        <div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Affect</span>
                            <div className="flex items-center space-x-2 mt-1">
                                {selectedAffect.iconUrl && (
                                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center overflow-hidden">
                                        <img src={selectedAffect.iconUrl} className="w-full h-full object-cover" alt="Icon" />
                                    </div>
                                )}
                                <p className="font-medium text-gray-800">{selectedAffect.name}</p>
                            </div>
                        </div>
                    )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <span className="text-xs font-bold text-indigo-400 uppercase">Primary</span>
                  <p className="font-bold text-indigo-900">{simResult.primaryTerrain}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <span className="text-xs font-bold text-indigo-400 uppercase">Secondary</span>
                  <p className="font-bold text-indigo-900">{simResult.secondaryTerrain || 'None'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Scoring Breakdown</h4>
                
                <div className="space-y-2">
                  <span className="text-xs text-gray-500">Attraction</span>
                  {(Object.entries(simResult.scores) as [TerrainType, number][]).map(([terrain, score]) => (
                    <div key={terrain} className="flex items-center justify-between text-sm">
                      <span className="w-24 font-medium">{terrain}</span>
                      <div className="flex-1 mx-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500"
                          style={{ width: `${(score / 16) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono w-6 text-right font-bold">{score}</span>
                    </div>
                  ))}
                </div>

                {simResult.repulsionScores && (
                  <div className="space-y-2">
                    <span className="text-xs text-gray-500">Repulsion</span>
                    {(Object.entries(simResult.repulsionScores) as [TerrainType, number][]).map(([terrain, score]) => (
                      <div key={terrain} className="flex items-center justify-between text-sm">
                        <span className="w-24 font-medium text-gray-600">{terrain}</span>
                        <div className="flex-1 mx-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400"
                            style={{ width: `${(score / 8) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono w-6 text-right font-bold text-red-500">{score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {simResult.flags && simResult.flags.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  <span className="text-xs font-bold text-yellow-700 block mb-1">System Flags</span>
                  <div className="flex flex-wrap gap-1">
                    {simResult.flags.map((flag: string) => (
                      <span key={flag} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-200">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!masterPromptTemplate && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-6 text-sm text-amber-800">
                  <p className="font-bold mb-1">Master Prompt Template Missing</p>
                  <p>Go to Global Settings to configure the master prompt template so you can generate prompts here.</p>
                </div>
              )}

              {generatedPrompt && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-6 shadow-sm">
                  <h4 className="font-bold text-slate-700 mb-2 border-b border-slate-200 pb-2">Generated Master Prompt</h4>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed mb-4">{generatedPrompt}</p>
                  <button
                    onClick={runGemini}
                    disabled={runningGemini}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {runningGemini ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                    <span>Run in Gemini</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500 h-full flex flex-col items-center justify-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mb-2" />
              <p>Run a simulation to see results here.</p>
            </div>
          )}
        </div>
      </div>
      {showGeminiModal && geminiResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative">
            <h3 className="text-xl font-bold mb-4">Gemini Result</h3>
            <div className="bg-gray-50 p-4 rounded-lg border overflow-auto max-h-[60vh]">
              <pre className="text-xs sm:text-sm font-mono text-gray-700 whitespace-pre-wrap select-all">
                {geminiResult}
              </pre>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowGeminiModal(false)}
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
