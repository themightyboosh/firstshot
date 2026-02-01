import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, where, writeBatch, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { CASConfiguration, Situation, ScoringResult, Answers, SavedConfigSet, PromptElementsConfig } from './types';
import { defaultConfig } from './defaultConfig';

// Job status type for image generation
export interface ImageJobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
  archetypeId: string;
  queuePosition?: number;
}

// API base URL - uses environment variable or defaults to production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  'https://us-central1-realness-score.cloudfunctions.net';

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

// Direct Firestore access (bypasses Cloud Functions)
export const firestoreApi = {
  async getConfig(): Promise<CASConfiguration> {
    try {
      const docRef = doc(db, 'cas_config', 'main');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as CASConfiguration;
        // Check for placeholder data
        if (data.questions?.[0]?.text?.includes('Please Edit') ||
            data.questions?.[0]?.text?.includes('Terrain Question')) {
          console.log('Firestore has placeholder data, returning defaults');
          return defaultConfig;
        }
        return data;
      }
      console.log('No config in Firestore, returning defaults');
      return defaultConfig;
    } catch (error) {
      console.error('Firestore read error:', error);
      return defaultConfig;
    }
  },

  async saveConfig(config: CASConfiguration): Promise<void> {
    const docRef = doc(db, 'cas_config', 'main');
    await setDoc(docRef, {
      ...config,
      meta: {
        ...config.meta,
        lastUpdated: new Date().toISOString().split('T')[0],
      }
    });
  },

  async seedDefaults(): Promise<void> {
    await this.saveConfig(defaultConfig);
  },

  // Saved Configuration Sets
  async getConfigSets(): Promise<SavedConfigSet[]> {
    const snapshot = await getDocs(collection(db, 'cas_config_sets'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedConfigSet));
  },

  async saveConfigSet(configSet: Omit<SavedConfigSet, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<string> {
    const now = new Date().toISOString();
    const id = configSet.id || `config_${Date.now()}`;
    const docRef = doc(db, 'cas_config_sets', id);
    
    const existingDoc = await getDoc(docRef);
    
    // Ensure archetypes preserve image data when saving
    const configWithImages = {
      ...configSet.config,
      archetypes: configSet.config.archetypes.map(arch => ({
        ...arch,
        // Explicitly include image fields to ensure they're saved
        imageUrl: arch.imageUrl || null,
        imageDescription: arch.imageDescription || null,
      }))
    };
    
    const data: SavedConfigSet = {
      ...configSet,
      config: configWithImages,
      id,
      createdAt: existingDoc.exists() ? existingDoc.data().createdAt : now,
      updatedAt: now,
    };
    
    console.log('Saving config set with images:', data.config.archetypes.map(a => ({
      id: a.id,
      hasImage: !!a.imageUrl
    })));
    
    await setDoc(docRef, data);
    return id;
  },

  async deleteConfigSet(id: string): Promise<void> {
    await deleteDoc(doc(db, 'cas_config_sets', id));
  },

  async setActiveConfigSet(id: string): Promise<void> {
    // First, get all config sets and deactivate them
    const snapshot = await getDocs(collection(db, 'cas_config_sets'));
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(docSnap => {
      batch.update(docSnap.ref, { isActive: docSnap.id === id });
    });
    
    await batch.commit();
    
    // Also update the main config to use this set (including images!)
    const activeDoc = await getDoc(doc(db, 'cas_config_sets', id));
    if (activeDoc.exists()) {
      const configSet = activeDoc.data() as SavedConfigSet;
      
      // Ensure archetypes with images are preserved
      const configWithImages = {
        ...configSet.config,
        archetypes: configSet.config.archetypes.map(arch => ({
          ...arch,
          // Preserve image URLs from the config set
          imageUrl: arch.imageUrl || undefined,
          imageDescription: arch.imageDescription || undefined,
        }))
      };
      
      console.log('Activating config with images:', configWithImages.archetypes.map(a => ({
        id: a.id,
        name: a.name,
        hasImage: !!a.imageUrl
      })));
      
      await this.saveConfig(configWithImages);
    }
  }
};

// CAS Configuration API (uses Cloud Functions with Firestore fallback)
export const casApi = {
  getConfig: async (): Promise<CASConfiguration> => {
    // Try direct Firestore first (faster, no function deployment needed)
    try {
      return await firestoreApi.getConfig();
    } catch (error) {
      console.warn('Direct Firestore failed, trying API:', error);
    }
    
    // Fallback to API
    try {
      const config = await apiFetch<CASConfiguration>('getCasConfig', { method: 'GET' });
      if (!config.questions || config.questions.length === 0 || 
          config.questions[0]?.text?.includes('Please Edit')) {
        return defaultConfig;
      }
      return config;
    } catch (error) {
      console.warn('API failed, using defaults:', error);
      return defaultConfig;
    }
  },
  
  updateConfig: async (config: CASConfiguration): Promise<{ success: boolean }> => {
    // Write directly to Firestore (no Cloud Function needed)
    await firestoreApi.saveConfig(config);
    return { success: true };
  },
  
  initConfig: async (force = false): Promise<{ message: string }> => {
    // Seed directly to Firestore
    if (force) {
      await firestoreApi.seedDefaults();
      return { message: 'Seeded default configuration to Firestore' };
    }
    
    // Check if config exists
    const existing = await firestoreApi.getConfig();
    if (existing.questions?.[0]?.text?.includes('Please Edit') ||
        existing.questions?.[0]?.text?.includes('Terrain Question') ||
        existing === defaultConfig) {
      await firestoreApi.seedDefaults();
      return { message: 'Seeded default configuration to Firestore' };
    }
    
    return { message: 'Configuration already exists' };
  },

  calculateScore: (answers: Answers) =>
    apiFetch<ScoringResult>('calculateTerrainScore', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
};

// Situations API
export const situationsApi = {
  getAll: () => apiFetch<Situation[]>('getSituations', { method: 'GET' }),
  
  create: (situation: Omit<Situation, 'id'>) =>
    apiFetch<Situation>('createSituation', {
      method: 'POST',
      body: JSON.stringify(situation),
    }),
  
  update: (situation: Situation) =>
    apiFetch<{ success: boolean }>('updateSituation', {
      method: 'POST',
      body: JSON.stringify(situation),
    }),
  
  delete: (id: string) =>
    apiFetch<{ success: boolean }>('deleteSituation', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),
};

// Prompt Elements API
export const promptElementsApi = {
  // Get prompt elements config
  async getConfig(): Promise<PromptElementsConfig> {
    const docRef = doc(db, 'prompt_elements', 'main');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as PromptElementsConfig;
    }
    
    // Return empty config if none exists
    return {
      stylePrompt: '',
      updatedAt: new Date().toISOString()
    };
  },

  // Save prompt elements config
  async saveConfig(config: PromptElementsConfig): Promise<void> {
    const docRef = doc(db, 'prompt_elements', 'main');
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString()
    });
  }
};

// Archetype Image API
export const archetypeImageApi = {
  // Upload an image for an archetype
  async uploadImage(archetypeId: string, file: File): Promise<string> {
    const filename = `${archetypeId}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `archetype-images/${filename}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // Queue image generation job
  async generateImage(archetypeId: string, archetypeName: string, imageDescription: string, stylePrompt: string): Promise<{ jobId: string }> {
    const fullPrompt = stylePrompt 
      ? `${imageDescription}. ${stylePrompt}`
      : imageDescription;
    
    return apiFetch<{ jobId: string }>('generateArchetypeImage', {
      method: 'POST',
      body: JSON.stringify({
        archetypeId,
        archetypeName,
        prompt: fullPrompt
      }),
    });
  },

  // Check job status (one-time fetch)
  async getJobStatus(jobId: string): Promise<{ status: string; imageUrl?: string; error?: string }> {
    return apiFetch<{ status: string; imageUrl?: string; error?: string }>(`getImageJobStatus?jobId=${jobId}`, {
      method: 'GET',
    });
  },

  // Trigger processing for a job (Serverless coordination)
  async triggerJobProcessing(jobId: string): Promise<{ success: boolean; imageUrl?: string }> {
    // Note: This request is intentionally long-running (up to 9 mins)
    // In a real browser, this might time out, but the Cloud Function keeps running.
    // We catch the error but ignore timeouts since we rely on Firestore for status.
    try {
      return await apiFetch<{ success: boolean; imageUrl?: string }>('processImageJob', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });
    } catch (err: unknown) {
      // If it's a timeout (common), that's fine - the job is still running in the background function
      console.log('Trigger request completed or timed out:', err);
      return { success: false };
    }
  },

  // Subscribe to job status updates (realtime)
  // Returns an unsubscribe function
  subscribeToJob(jobId: string, onUpdate: (status: ImageJobStatus) => void): Unsubscribe {
    const jobRef = doc(db, 'image_generation_jobs', jobId);
    
    return onSnapshot(jobRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onUpdate({
          id: snapshot.id,
          status: data.status,
          imageUrl: data.imageUrl,
          error: data.error,
          archetypeId: data.archetypeId,
          queuePosition: data.queuePosition,
        });
      }
    }, (error) => {
      console.error('Job subscription error:', error);
    });
  }
};
