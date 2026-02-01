import { useEffect, useState, useRef } from 'react';
import { Save, Loader2, PlayCircle, Plus, Trash2, GripVertical, RefreshCw, BarChart3, FolderOpen, Check, Star, Shuffle, Download, Upload, Sparkles, Image } from 'lucide-react';
import { casApi, firestoreApi, archetypeImageApi, promptElementsApi } from '../lib/api';
import { defaultConfig } from '../lib/defaultConfig';
import type { CASConfiguration, Question, Archetype, ScoringResult, TerrainType, RankedAnswer, QuestionOption, SavedConfigSet } from '../lib/types';

type TabType = 'questions' | 'archetypes' | 'stats' | 'configurations' | 'simulator';

const TERRAIN_OPTIONS: TerrainType[] = ['Anxious', 'Avoidant', 'Secure', 'Disorganized'];

const terrainColors: Record<TerrainType, string> = {
  Secure: 'bg-green-100 text-green-700 border-green-300',
  Anxious: 'bg-red-100 text-red-700 border-red-300',
  Avoidant: 'bg-blue-100 text-blue-700 border-blue-300',
  Disorganized: 'bg-purple-100 text-purple-700 border-purple-300',
};

const terrainBgColors: Record<TerrainType, string> = {
  Secure: 'bg-green-500',
  Anxious: 'bg-red-500',
  Avoidant: 'bg-blue-500',
  Disorganized: 'bg-purple-500',
};

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function CASConfig() {
  const [config, setConfig] = useState<CASConfiguration | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('questions');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Simulator State
  const [simRankedAnswers, setSimRankedAnswers] = useState<Record<string, Partial<RankedAnswer>>>({});
  const [simResult, setSimResult] = useState<ScoringResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Configurations State
  const [configSets, setConfigSets] = useState<SavedConfigSet[]>([]);
  const [loadingConfigSets, setLoadingConfigSets] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  const [newConfigDesc, setNewConfigDesc] = useState('');
  const [activatingId, setActivatingId] = useState<string | null>(null);
  
  // Import/Export
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Archetype Image State
  const [generatingImageFor, setGeneratingImageFor] = useState<string | null>(null);
  const [uploadingImageFor, setUploadingImageFor] = useState<string | null>(null);
  const [stylePrompt, setStylePrompt] = useState<string>('');
  const archetypeImageRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    loadConfig();
    loadStylePrompt();
  }, []);

  useEffect(() => {
    if (activeTab === 'configurations') {
      loadConfigSets();
    }
  }, [activeTab]);

  const loadStylePrompt = async () => {
    try {
      const promptConfig = await promptElementsApi.getConfig();
      setStylePrompt(promptConfig.stylePrompt || '');
    } catch (err) {
      console.error('Failed to load style prompt:', err);
    }
  };

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await casApi.getConfig();
      if (!result.questions || result.questions.length === 0 || 
          result.questions[0]?.text?.includes('Please Edit') ||
          result.questions[0]?.text?.includes('Terrain Question')) {
        setConfig(defaultConfig);
      } else {
        setConfig(result);
      }
    } catch (err) {
      console.error(err);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const loadConfigSets = async () => {
    setLoadingConfigSets(true);
    try {
      const sets = await firestoreApi.getConfigSets();
      setConfigSets(sets);
    } catch (err) {
      console.error('Failed to load config sets:', err);
    } finally {
      setLoadingConfigSets(false);
    }
  };

  // Export current config as JSON file
  const exportConfig = () => {
    if (!config) return;
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      config: config
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cas-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSuccessMsg('Configuration exported successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Import config from JSON file
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the imported data has the expected structure
      const importedConfig = data.config || data;
      
      if (!importedConfig.questions || !Array.isArray(importedConfig.questions)) {
        throw new Error('Invalid config: missing questions array');
      }
      if (!importedConfig.archetypes || !Array.isArray(importedConfig.archetypes)) {
        throw new Error('Invalid config: missing archetypes array');
      }
      
      // Ensure meta field exists
      const validConfig: CASConfiguration = {
        meta: importedConfig.meta || {
          version: '1.0',
          lastUpdated: new Date().toISOString().split('T')[0],
          name: 'Imported Configuration'
        },
        questions: importedConfig.questions,
        archetypes: importedConfig.archetypes
      };
      
      // Generate a name for the imported config
      const importName = `Imported ${new Date().toLocaleString()}`;
      
      // Save as a new config set
      await firestoreApi.saveConfigSet({
        name: importName,
        description: `Imported from ${file.name}`,
        isActive: false,
        config: validConfig
      });
      
      // Reload config sets to show the new import
      await loadConfigSets();
      
      setSuccessMsg(`Configuration imported as "${importName}". You can find it in the Saved Configuration Sets below.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import configuration');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updatedConfig = {
        ...config,
        meta: {
          ...config.meta,
          lastUpdated: new Date().toISOString().split('T')[0],
        }
      };
      await casApi.updateConfig(updatedConfig);
      setConfig(updatedConfig);
      setSuccessMsg('Configuration saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error saving: ${message}`);
    } finally {
      setSaving(false);
    }
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
    
    const randomAnswers: Record<string, RankedAnswer> = {};
    
    config.questions.forEach(q => {
      // Shuffle options indices
      const indices = [0, 1, 2, 3];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      
      // Assign first 3 shuffled options as first, second, repulsion
      randomAnswers[q.id] = {
        first: q.options[indices[0]].id,
        second: q.options[indices[1]].id,
        repulsion: q.options[indices[2]].id,
      };
    });
    
    // Update state to show the selections
    setSimRankedAnswers(randomAnswers);
    
    // Run simulation with the random answers
    await runSimulation(randomAnswers);
  };

  // === QUESTION CRUD ===
  
  const addQuestion = () => {
    if (!config) return;
    const newId = `q${config.questions.length + 1}_${generateId()}`;
    const newQuestion: Question = {
      id: newId,
      text: 'New question - click to edit',
      options: TERRAIN_OPTIONS.map(terrain => ({
        id: `${newId}_${terrain.toLowerCase()}`,
        text: `${terrain} option - click to edit`,
        terrain,
      })),
    };
    setConfig({
      ...config,
      questions: [...config.questions, newQuestion],
    });
  };

  const deleteQuestion = (idx: number) => {
    if (!config) return;
    if (!confirm('Are you sure you want to delete this question?')) return;
    const newQuestions = config.questions.filter((_, i) => i !== idx);
    setConfig({ ...config, questions: newQuestions });
  };

  const updateQuestion = (idx: number, updates: Partial<Question>) => {
    if (!config) return;
    const newQuestions = [...config.questions];
    newQuestions[idx] = { ...newQuestions[idx], ...updates };
    setConfig({ ...config, questions: newQuestions });
  };

  const updateQuestionOption = (qIdx: number, optIdx: number, updates: Partial<QuestionOption>) => {
    if (!config) return;
    const newQuestions = [...config.questions];
    newQuestions[qIdx].options[optIdx] = { ...newQuestions[qIdx].options[optIdx], ...updates };
    setConfig({ ...config, questions: newQuestions });
  };

  // === ARCHETYPE CRUD ===

  const addArchetype = () => {
    if (!config) return;
    const newId = `archetype_${generateId()}`;
    const newArchetype: Archetype = {
      id: newId,
      name: 'New Archetype',
      primaryTerrain: 'Secure',
      secondaryTerrain: null,
      profileData: {
        coreRecognition: 'Enter core recognition text...',
        protectiveLogic: 'Enter protective logic text...',
        costUnderStress: 'Enter cost under stress text...',
        repulsionDisavowal: 'Enter repulsion/disavowal text...',
      },
    };
    setConfig({
      ...config,
      archetypes: [...config.archetypes, newArchetype],
    });
  };

  const deleteArchetype = (idx: number) => {
    if (!config) return;
    if (!confirm('Are you sure you want to delete this archetype?')) return;
    const newArchetypes = config.archetypes.filter((_, i) => i !== idx);
    setConfig({ ...config, archetypes: newArchetypes });
  };

  const updateArchetype = (idx: number, updates: Partial<Archetype>) => {
    if (!config) return;
    const newArchetypes = [...config.archetypes];
    newArchetypes[idx] = { ...newArchetypes[idx], ...updates };
    setConfig({ ...config, archetypes: newArchetypes });
  };

  const updateArchetypeProfile = (idx: number, field: keyof Archetype['profileData'], value: string) => {
    if (!config) return;
    const newArchetypes = [...config.archetypes];
    newArchetypes[idx].profileData[field] = value;
    setConfig({ ...config, archetypes: newArchetypes });
  };

  // === CONFIGURATION SETS ===

  const saveCurrentAsConfigSet = async () => {
    if (!config || !newConfigName.trim()) {
      alert('Please enter a name for the configuration set');
      return;
    }
    
    try {
      await firestoreApi.saveConfigSet({
        name: newConfigName.trim(),
        description: newConfigDesc.trim(),
        isActive: false,
        config,
      });
      setNewConfigName('');
      setNewConfigDesc('');
      await loadConfigSets();
      setSuccessMsg('Configuration set saved!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save config set');
    }
  };

  const loadConfigSet = (configSet: SavedConfigSet) => {
    setConfig(configSet.config);
    setSuccessMsg(`Loaded "${configSet.name}". Click "Save Changes" to make it the active config.`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const deleteConfigSet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration set?')) return;
    try {
      await firestoreApi.deleteConfigSet(id);
      await loadConfigSets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const setActiveConfig = async (id: string) => {
    setError(null);
    setActivatingId(id);
    try {
      console.log('Setting active config:', id);
      await firestoreApi.setActiveConfigSet(id);
      console.log('Config set activated, reloading...');
      await loadConfigSets();
      await loadConfig();
      setSuccessMsg('Configuration set activated!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('setActiveConfig error:', err);
      setError(err instanceof Error ? err.message : 'Failed to activate configuration');
    } finally {
      setActivatingId(null);
    }
  };

  // === ARCHETYPE IMAGE HELPERS ===

  const handleArchetypeImageUpload = async (archetypeId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;

    setUploadingImageFor(archetypeId);
    setError(null);
    try {
      const imageUrl = await archetypeImageApi.uploadImage(archetypeId, file);
      
      // Update the archetype with the new image URL
      setConfig({
        ...config,
        archetypes: config.archetypes.map(arch =>
          arch.id === archetypeId ? { ...arch, imageUrl } : arch
        )
      });
      
      setSuccessMsg('Image uploaded! Remember to save changes.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploadingImageFor(null);
      const ref = archetypeImageRefs.current[archetypeId];
      if (ref) ref.value = '';
    }
  };

  const handleGenerateImage = async (archetype: Archetype) => {
    if (!archetype.imageDescription) {
      setError('Please add an image description before generating');
      return;
    }

    setGeneratingImageFor(archetype.id);
    setError(null);
    try {
      const result = await archetypeImageApi.generateImage(
        archetype.id,
        archetype.name,
        archetype.imageDescription,
        stylePrompt
      );
      
      // Update archetype with job ID
      if (config) {
        setConfig({
          ...config,
          archetypes: config.archetypes.map(arch =>
            arch.id === archetype.id ? { ...arch, imageJobId: result.jobId } : arch
          )
        });
      }
      
      setSuccessMsg(`Image generation started (Job: ${result.jobId}). This may take a minute...`);
      setTimeout(() => setSuccessMsg(null), 5000);
      
      // Poll for job completion
      pollJobStatus(archetype.id, result.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start image generation');
    } finally {
      setGeneratingImageFor(null);
    }
  };

  const pollJobStatus = async (archetypeId: string, jobId: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;
    
    const poll = async () => {
      try {
        const status = await archetypeImageApi.getJobStatus(jobId);
        
        if (status.status === 'completed' && status.imageUrl) {
          // Update archetype with generated image
          if (config) {
            setConfig(prev => prev ? {
              ...prev,
              archetypes: prev.archetypes.map(arch =>
                arch.id === archetypeId 
                  ? { ...arch, imageUrl: status.imageUrl, imageJobId: undefined } 
                  : arch
              )
            } : null);
          }
          setSuccessMsg('Image generated successfully! Remember to save changes.');
          setTimeout(() => setSuccessMsg(null), 5000);
          return;
        }
        
        if (status.status === 'failed') {
          setError(`Image generation failed: ${status.error || 'Unknown error'}`);
          // Clear job ID
          if (config) {
            setConfig(prev => prev ? {
              ...prev,
              archetypes: prev.archetypes.map(arch =>
                arch.id === archetypeId ? { ...arch, imageJobId: undefined } : arch
              )
            } : null);
          }
          return;
        }
        
        // Still processing
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setError('Image generation timed out. Please check back later.');
        }
      } catch (err) {
        console.error('Poll error:', err);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        }
      }
    };
    
    // Start polling after initial delay
    setTimeout(poll, 5000);
  };

  const removeArchetypeImage = (archetypeId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      archetypes: config.archetypes.map(arch =>
        arch.id === archetypeId ? { ...arch, imageUrl: undefined, imageJobId: undefined } : arch
      )
    });
  };

  // === SIMULATOR HELPERS ===

  const setRankedSelection = (questionId: string, rank: keyof RankedAnswer, optionId: string) => {
    const current = simRankedAnswers[questionId] || {};
    const updated: Partial<RankedAnswer> = { ...current };
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

  // === STATS CALCULATIONS ===

  const calculateStats = () => {
    if (!config) return null;

    const numQuestions = config.questions.length;
    const numArchetypes = config.archetypes.length;
    
    // Count options per terrain
    const terrainCounts: Record<TerrainType, number> = {
      Anxious: 0, Avoidant: 0, Secure: 0, Disorganized: 0
    };
    
    config.questions.forEach(q => {
      q.options.forEach(opt => {
        terrainCounts[opt.terrain]++;
      });
    });

    // Calculate possible score distributions (simple mode)
    const totalOptions = numQuestions * 4;
    const maxScorePerTerrain = numQuestions; // In simple mode, max is 1 point per question
    
    // Archetype terrain distribution
    const archetypePrimary: Record<TerrainType, number> = {
      Anxious: 0, Avoidant: 0, Secure: 0, Disorganized: 0
    };
    const archetypeSecondary: Record<TerrainType, number> = {
      Anxious: 0, Avoidant: 0, Secure: 0, Disorganized: 0
    };
    
    config.archetypes.forEach(arch => {
      archetypePrimary[arch.primaryTerrain as TerrainType]++;
      if (arch.secondaryTerrain) {
        archetypeSecondary[arch.secondaryTerrain]++;
      }
    });

    // Simulate random distribution (Monte Carlo)
    const simulations = 10000;
    const archetypeHits: Record<string, number> = {};
    config.archetypes.forEach(a => archetypeHits[a.id] = 0);
    
    for (let i = 0; i < simulations; i++) {
      const scores: Record<TerrainType, number> = {
        Anxious: 0, Avoidant: 0, Secure: 0, Disorganized: 0
      };
      
      // Random answers for each question
      config.questions.forEach(q => {
        const randomOption = q.options[Math.floor(Math.random() * q.options.length)];
        scores[randomOption.terrain]++;
      });
      
      // Determine primary/secondary
      const sorted = (Object.keys(scores) as TerrainType[]).sort((a, b) => scores[b] - scores[a]);
      const primary = sorted[0];
      const secondary = sorted[1];
      
      // Find matching archetype
      const match = config.archetypes.find(a => 
        a.primaryTerrain === primary && 
        (a.secondaryTerrain === secondary || a.secondaryTerrain === null)
      );
      
      if (match) {
        archetypeHits[match.id]++;
      }
    }

    return {
      numQuestions,
      numArchetypes,
      totalOptions,
      terrainCounts,
      maxScorePerTerrain,
      archetypePrimary,
      archetypeSecondary,
      archetypeDistribution: Object.entries(archetypeHits).map(([id, hits]) => ({
        archetype: config.archetypes.find(a => a.id === id),
        probability: (hits / simulations) * 100
      })).sort((a, b) => b.probability - a.probability)
    };
  };

  // === RENDER ===

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-gray-500">Loading configuration...</p>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button 
            onClick={loadConfig}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 mb-4">No configuration found. Please seed the database first.</p>
          <a href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const rankLabels: Record<keyof RankedAnswer, { label: string; color: string }> = {
    first: { label: '1st', color: 'bg-green-500 text-white' },
    second: { label: '2nd', color: 'bg-yellow-500 text-white' },
    repulsion: { label: 'Least', color: 'bg-red-500 text-white' },
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Terrain Configuration</h2>
          <p className="text-sm text-gray-500">
            Version {config.meta.version} • Last updated: {config.meta.lastUpdated}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadConfig}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            title="Reload from server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline text-sm">Dismiss</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['questions', 'archetypes', 'stats', 'configurations', 'simulator'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors flex items-center space-x-1 ${
              activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'stats' && <BarChart3 className="w-4 h-4" />}
            {tab === 'configurations' && <FolderOpen className="w-4 h-4" />}
            <span>
              {tab} 
              {tab === 'questions' && ` (${config.questions.length})`}
              {tab === 'archetypes' && ` (${config.archetypes.length})`}
              {tab === 'configurations' && ` (${configSets.length})`}
            </span>
          </button>
        ))}
      </div>

      {/* Questions Editor */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              {config.questions.length} questions. Each has 4 options (one per terrain).
            </p>
            <button
              onClick={addQuestion}
              className="flex items-center space-x-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>+ ADD QUESTION</span>
            </button>
          </div>

          {config.questions.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
              No questions yet. Click "Add Question" to create one, or seed the database from the Dashboard.
            </div>
          ) : (
            config.questions.map((q: Question, idx: number) => (
              <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <GripVertical className="w-5 h-5 text-gray-300" />
                    <span className="text-sm font-bold text-gray-400">Question {idx + 1}</span>
                    <span className="text-xs text-gray-300 font-mono">{q.id}</span>
                  </div>
                  <button
                    onClick={() => deleteQuestion(idx)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg border border-red-200"
                    title="Delete question"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <textarea
                  rows={2}
                  className="w-full text-lg font-medium border border-gray-200 rounded-lg p-3 mb-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={q.text}
                  onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                  placeholder="Enter question text..."
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((opt, optIdx) => (
                    <div key={opt.id} className={`p-4 rounded-lg border-2 ${terrainColors[opt.terrain]}`}>
                      <div className="flex justify-between items-center mb-2">
                        <select
                          value={opt.terrain}
                          onChange={(e) => updateQuestionOption(idx, optIdx, { terrain: e.target.value as TerrainType })}
                          className="text-xs font-bold px-2 py-1 rounded border-0 bg-white/50 focus:outline-none"
                        >
                          {TERRAIN_OPTIONS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        rows={3}
                        className="w-full bg-white/50 rounded p-2 text-sm focus:outline-none focus:bg-white resize-none"
                        value={opt.text}
                        onChange={(e) => updateQuestionOption(idx, optIdx, { text: e.target.value })}
                        placeholder={`Enter ${opt.terrain} response...`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Archetypes Editor */}
      {activeTab === 'archetypes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              {config.archetypes.length} archetypes. Each maps to a primary + secondary terrain.
            </p>
            <button
              onClick={addArchetype}
              className="flex items-center space-x-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>+ ADD ARCHETYPE</span>
            </button>
          </div>

          {config.archetypes.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
              No archetypes yet. Click "Add Archetype" to create one.
            </div>
          ) : (
            config.archetypes.map((arch: Archetype, idx: number) => (
              <div key={arch.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
                    <input
                      type="text"
                      className="text-xl font-bold border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none w-full"
                      value={arch.name}
                      onChange={(e) => updateArchetype(idx, { name: e.target.value })}
                    />
                    <span className="text-xs text-gray-300 font-mono">{arch.id}</span>
                  </div>
                  <button
                    onClick={() => deleteArchetype(idx)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg border border-red-200"
                    title="Delete archetype"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex space-x-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Primary Terrain</label>
                    <select
                      value={arch.primaryTerrain}
                      onChange={(e) => updateArchetype(idx, { primaryTerrain: e.target.value as TerrainType })}
                      className="border rounded-lg px-3 py-2 text-sm"
                    >
                      {TERRAIN_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Secondary Terrain</label>
                    <select
                      value={arch.secondaryTerrain || ''}
                      onChange={(e) => updateArchetype(idx, { secondaryTerrain: e.target.value ? e.target.value as TerrainType : null })}
                      className="border rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">None</option>
                      {TERRAIN_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {(['coreRecognition', 'protectiveLogic', 'costUnderStress', 'repulsionDisavowal'] as const).map(field => (
                    <div key={field}>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        value={arch.profileData[field]}
                        onChange={(e) => updateArchetypeProfile(idx, field, e.target.value)}
                      />
                    </div>
                  ))}
                  
                  {/* Image Description for AI Prompts */}
                  <div className="border-t pt-4 mt-4">
                    <label className="block text-xs font-bold text-purple-600 uppercase mb-1">
                      Image Description (for AI prompts)
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-3 border border-purple-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-purple-50"
                      placeholder="Describe the visual representation for this archetype... e.g., 'A person standing at a crossroads, looking back over their shoulder with a mix of longing and uncertainty...'"
                      value={arch.imageDescription || ''}
                      onChange={(e) => updateArchetype(idx, { imageDescription: e.target.value })}
                    />
                    <p className="text-xs text-gray-400 mt-1">This description will be used when generating AI images for this archetype.</p>
                  </div>

                  {/* Archetype Image */}
                  <div className="border-t pt-4 mt-4">
                    <label className="block text-xs font-bold text-indigo-600 uppercase mb-2">
                      Archetype Image
                    </label>
                    <div className="flex items-start space-x-4">
                      {/* Image Preview */}
                      <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border-2 border-dashed border-gray-300">
                        {arch.imageUrl ? (
                          <div className="relative w-full h-full group">
                            <img
                              src={arch.imageUrl}
                              alt={arch.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeArchetypeImage(arch.id)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : arch.imageJobId ? (
                          <div className="w-full h-full flex flex-col items-center justify-center text-indigo-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-1" />
                            <span className="text-xs">Generating...</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Image className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-2">
                        <input
                          ref={(el) => { archetypeImageRefs.current[arch.id] = el; }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleArchetypeImageUpload(arch.id, e)}
                          className="hidden"
                        />
                        <button
                          onClick={() => archetypeImageRefs.current[arch.id]?.click()}
                          disabled={uploadingImageFor === arch.id}
                          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                          {uploadingImageFor === arch.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span>Upload Image</span>
                        </button>
                        <button
                          onClick={() => handleGenerateImage(arch)}
                          disabled={generatingImageFor === arch.id || !arch.imageDescription}
                          className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50"
                        >
                          {generatingImageFor === arch.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          <span>Generate with AI</span>
                        </button>
                        {!arch.imageDescription && (
                          <p className="text-xs text-amber-600">Add an image description first</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-3xl font-bold text-indigo-600">{stats.numQuestions}</div>
              <div className="text-sm text-gray-500">Questions</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-3xl font-bold text-indigo-600">{stats.totalOptions}</div>
              <div className="text-sm text-gray-500">Total Options</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-3xl font-bold text-indigo-600">{stats.numArchetypes}</div>
              <div className="text-sm text-gray-500">Archetypes</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-3xl font-bold text-indigo-600">{stats.maxScorePerTerrain}</div>
              <div className="text-sm text-gray-500">Max Score/Terrain</div>
            </div>
          </div>

          {/* Terrain Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4">Terrain Option Distribution</h3>
            <p className="text-sm text-gray-500 mb-4">Options per terrain across all questions (should be equal for balance)</p>
            <div className="space-y-3">
              {TERRAIN_OPTIONS.map(terrain => (
                <div key={terrain} className="flex items-center space-x-3">
                  <div className="w-24 text-sm font-medium">{terrain}</div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${terrainBgColors[terrain]} flex items-center justify-end pr-2`}
                      style={{ width: `${(stats.terrainCounts[terrain] / stats.totalOptions) * 100}%` }}
                    >
                      <span className="text-white text-sm font-bold">{stats.terrainCounts[terrain]}</span>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm text-gray-500">
                    {((stats.terrainCounts[terrain] / stats.totalOptions) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Archetype Probability Distribution (Monte Carlo) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4">Archetype Probability (Random Answers)</h3>
            <p className="text-sm text-gray-500 mb-4">Based on 10,000 simulated random answer sets</p>
            <div className="space-y-3">
              {stats.archetypeDistribution.map(({ archetype, probability }) => (
                archetype && (
                  <div key={archetype.id} className="flex items-center space-x-3">
                    <div className="w-40 text-sm font-medium truncate">{archetype.name}</div>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500"
                        style={{ width: `${probability}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-mono">
                      {probability.toFixed(1)}%
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Archetype Terrain Coverage */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4">Archetype Terrain Coverage</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Primary Terrain</h4>
                {TERRAIN_OPTIONS.map(terrain => (
                  <div key={terrain} className="flex items-center justify-between py-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${terrainColors[terrain]}`}>{terrain}</span>
                    <span className="font-mono">{stats.archetypePrimary[terrain]}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3">Secondary Terrain</h4>
                {TERRAIN_OPTIONS.map(terrain => (
                  <div key={terrain} className="flex items-center justify-between py-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${terrainColors[terrain]}`}>{terrain}</span>
                    <span className="font-mono">{stats.archetypeSecondary[terrain]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configurations Tab */}
      {activeTab === 'configurations' && (
        <div className="space-y-6">
          {/* Import/Export Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border">
            <h3 className="text-lg font-bold mb-4">Import / Export</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={exportConfig}
                disabled={!config}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Export Current Config</span>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Upload className="w-4 h-4" />
                <span>Import from JSON</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Export downloads your current configuration as a JSON file. Import creates a new saved configuration set.
            </p>
          </div>

          {/* Save Current as New Set */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4">Save Current Configuration as New Set</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newConfigName}
                  onChange={(e) => setNewConfigName(e.target.value)}
                  placeholder="e.g., Relationship Assessment v2"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newConfigDesc}
                  onChange={(e) => setNewConfigDesc(e.target.value)}
                  placeholder="Optional description..."
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <button
              onClick={saveCurrentAsConfigSet}
              disabled={!newConfigName.trim()}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save as New Configuration Set</span>
            </button>
          </div>

          {/* Saved Configuration Sets */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold mb-4">Saved Configuration Sets</h3>
            
            {loadingConfigSets ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : configSets.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-lg border border-dashed border-gray-300 text-center text-gray-500">
                No saved configuration sets yet. Save your current configuration above.
              </div>
            ) : (
              <div className="space-y-3">
                {configSets.map(configSet => (
                  <div 
                    key={configSet.id} 
                    className={`p-4 rounded-lg border-2 ${configSet.isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold">{configSet.name}</h4>
                          {configSet.isActive && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>ACTIVE</span>
                            </span>
                          )}
                        </div>
                        {configSet.description && (
                          <p className="text-sm text-gray-500 mt-1">{configSet.description}</p>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          {configSet.config.questions.length} questions • {configSet.config.archetypes.length} archetypes • 
                          Updated: {new Date(configSet.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => loadConfigSet(configSet)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Load
                        </button>
                        {!configSet.isActive && (
                          <button
                            onClick={() => setActiveConfig(configSet.id)}
                            disabled={activatingId === configSet.id}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                          >
                            {activatingId === configSet.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            <span>{activatingId === configSet.id ? 'Activating...' : 'Set Active'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteConfigSet(configSet.id)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
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
        </div>
      )}

      {/* Simulator */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Simulate Answers</h3>
              <button
                onClick={randomizeAndCalculate}
                disabled={simulating}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
              >
                <Shuffle className="w-4 h-4" />
                <span>Randomize & Calculate</span>
              </button>
            </div>

            <div className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-800">
              <strong>Ranked Choice:</strong> Click options to assign: 
              <span className="mx-1 px-1.5 py-0.5 bg-green-500 text-white rounded text-xs">1st</span> Most like me (+2pts),
              <span className="mx-1 px-1.5 py-0.5 bg-yellow-500 text-white rounded text-xs">2nd</span> Next most (+1pt),
              <span className="mx-1 px-1.5 py-0.5 bg-red-500 text-white rounded text-xs">Least</span> Repulsion signal
            </div>

            {config.questions.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                No questions to simulate. Add questions first or seed the database.
              </div>
            ) : (
              <>
                {config.questions.map((q: Question) => (
                  <div key={q.id} className="bg-white p-4 rounded-lg border">
                    <p className="font-medium mb-3">{q.text}</p>
                    
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
                            type="button"
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
                            className={`w-full text-left p-2 rounded-lg border-2 transition-all ${
                              currentRank 
                                ? 'border-indigo-300 bg-indigo-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm">
                                {opt.text} <span className="text-gray-400 text-xs">({opt.terrain})</span>
                              </span>
                              {currentRank && (
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${rankLabels[currentRank].color}`}>
                                  {rankLabels[currentRank].label}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => runSimulation()}
                  disabled={simulating}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {simulating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <PlayCircle className="w-5 h-5" />
                  )}
                  <span>{simulating ? 'Calculating...' : 'Calculate Result'}</span>
                </button>
              </>
            )}
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

                <div className="space-y-2 mb-4">
                  <span className="text-xs font-bold text-gray-400">Attraction Scores</span>
                  {(Object.entries(simResult.scores) as [TerrainType, number][]).map(([terrain, score]) => (
                    <div key={terrain} className="flex items-center justify-between text-sm">
                      <span>{terrain}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${(score / 16) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono w-6 text-right">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {simResult.repulsionScores && (
                  <div className="space-y-2 mb-4">
                    <span className="text-xs font-bold text-gray-400">Repulsion Scores</span>
                    {(Object.entries(simResult.repulsionScores) as [TerrainType, number][]).map(([terrain, score]) => (
                      <div key={terrain} className="flex items-center justify-between text-sm">
                        <span>{terrain}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-400"
                              style={{ width: `${(score / 8) * 100}%` }}
                            />
                          </div>
                          <span className="font-mono w-6 text-right">{score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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
                Click "Randomize & Calculate" or select options manually.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
