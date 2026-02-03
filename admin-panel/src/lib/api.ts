import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import type { CASConfiguration, Situation, Affect, CMSItem, User, UsageStats, UserUsageStats, FeedbackItem, UserResponse, ScoringResult, Answers, SavedConfigSet, GlobalSettingsConfig } from './types';
import { defaultConfig } from './defaultConfig';

// Job status type for image generation
export interface ImageJobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
  archetypeId?: string;
  situationId?: string;
  queuePosition?: number;
  prompt?: string;
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
    console.error('API Error Response:', errorData);
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
    
    // Sanitize config to remove undefined values
    const sanitizedConfig = JSON.parse(JSON.stringify(config));
    
    await setDoc(docRef, {
      ...sanitizedConfig,
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
        imageUrl: arch.imageUrl || undefined,
        imageDescription: arch.imageDescription || undefined,
      }))
    };
    
    // Sanitize to remove undefined values
    const sanitizedConfig = JSON.parse(JSON.stringify(configWithImages));
    
    const data: SavedConfigSet = {
      ...configSet,
      config: sanitizedConfig,
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

// Global Settings API
export const globalSettingsApi = {
  // Get global settings config
  async getConfig(): Promise<GlobalSettingsConfig> {
    const docRef = doc(db, 'global_settings', 'main');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as GlobalSettingsConfig;
    }
    
    // Return empty config if none exists
    return {
      stylePrompt: '',
      appName: '',
      updatedAt: new Date().toISOString()
    };
  },

  // Save global settings config
  async saveConfig(config: GlobalSettingsConfig): Promise<void> {
    const docRef = doc(db, 'global_settings', 'main');
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString()
    });
  }
};

// Responses API
export const responsesApi = {
  getAll: () => apiFetch<UserResponse[]>('getUserResponses', { method: 'GET' }),
  clear: () => apiFetch<{ success: boolean; deletedCount: number }>('clearResponses', { method: 'POST' }),
};

// Feedback API
export const feedbackApi = {
  getAll: () => apiFetch<FeedbackItem[]>('getFeedback', { method: 'GET' }),
  submit: (data: Partial<FeedbackItem>) => apiFetch<{ success: boolean }>('submitFeedback', { method: 'POST', body: JSON.stringify(data) }),
  clear: () => apiFetch<{ success: boolean; deletedCount: number }>('clearFeedback', { method: 'POST' }),
};

// Usage API
export const usageApi = {
  getStats: () => apiFetch<UsageStats>('getUsageStats', { method: 'GET' }),
  getUserStats: (uid: string) => apiFetch<UserUsageStats>(`getUserUsageStats?uid=${uid}`, { method: 'GET' }),
};

// Users API
export const usersApi = {
  getAll: () => apiFetch<{ users: User[] }>('getUsers', { method: 'GET' }),
  
  create: (data: Partial<User> & { password?: string; generateInviteLink?: boolean }) => 
    apiFetch<{ success: boolean; user: User; inviteLink?: string }>('createUser', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    
  generateResetLink: (uid: string) =>
    apiFetch<{ success: boolean; link: string }>('generateUserResetLink', {
      method: 'POST',
      body: JSON.stringify({ uid }),
    }),
    
  updateRole: (uid: string, role: string) => 
    apiFetch<{ success: boolean }>('updateUserRole', { 
      method: 'POST', 
      body: JSON.stringify({ uid, role }) 
    }),
    
  delete: (uid: string) => 
    apiFetch<{ success: boolean }>('deleteUser', { 
      method: 'POST', 
      body: JSON.stringify({ uid }) 
    }),
};

// CMS API
export const cmsApi = {
  getAll: () => apiFetch<CMSItem[]>('getCMSItems', { method: 'GET' }),
  
  create: (item: Partial<CMSItem>) =>
    apiFetch<CMSItem>('createCMSItem', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  
  update: (item: Partial<CMSItem>) =>
    apiFetch<{ success: boolean }>('updateCMSItem', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  
  delete: (id: string) =>
    apiFetch<{ success: boolean }>('deleteCMSItem', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }),
};

// Affects API
export const affectsApi = {
  getAll: () => apiFetch<Affect[]>('getAffects', { method: 'GET' }),
  
  update: (affect: Affect) =>
    apiFetch<{ success: boolean }>('updateAffect', {
      method: 'POST',
      body: JSON.stringify(affect),
    }),
    
  reset: () => 
    apiFetch<{ success: boolean }>('resetAffects', { method: 'POST' }),
};

// Gemini API
export const geminiApi = {
  runPrompt: (prompt: string) =>
    apiFetch<{ success: boolean; text: string }>('runGeminiPrompt', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),
};

// Image Generation API
export const imageGenerationApi = {
  // Upload an image (generic)
  async uploadImage(id: string, file: File, folder: 'archetype-images' | 'situation-images' | 'affect-icons' | 'cms-images' | 'global-assets' = 'archetype-images'): Promise<string> {
    const filename = `${id}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${filename}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  // Queue image generation job for Archetype
  async generateArchetypeImage(archetypeId: string, archetypeName: string, imageDescription: string, stylePrompt: string): Promise<{ jobId: string }> {
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

  // Queue image generation job for Situation
  async generateSituationImage(situationId: string, situationName: string, imageDescription: string, stylePrompt: string): Promise<{ jobId: string }> {
    const fullPrompt = stylePrompt 
      ? `${imageDescription}. ${stylePrompt}`
      : imageDescription;
    
    return apiFetch<{ jobId: string }>('generateArchetypeImage', { // Reusing endpoint as it is generic now
      method: 'POST',
      body: JSON.stringify({
        situationId,
        situationName,
        prompt: fullPrompt
      }),
    });
  },

  // Queue image generation job for CMS
  async generateCMSImage(cmsId: string, cmsName: string, imageDescription: string, stylePrompt: string): Promise<{ jobId: string }> {
    const fullPrompt = stylePrompt 
      ? `${imageDescription}. ${stylePrompt}`
      : imageDescription;
    
    return apiFetch<{ jobId: string }>('generateArchetypeImage', {
      method: 'POST',
      body: JSON.stringify({
        cmsId,
        cmsName,
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
    try {
      return await apiFetch<{ success: boolean; imageUrl?: string }>('processImageJob', {
        method: 'POST',
        body: JSON.stringify({ jobId }),
      });
    } catch (err: unknown) {
      console.log('Trigger request completed or timed out:', err);
      return { success: false };
    }
  },

  // Clear image generation queue
  async clearQueue(): Promise<{ success: boolean; count: number }> {
    return apiFetch<{ success: boolean; count: number }>('clearImageJobQueue', {
      method: 'POST',
    });
  },

  // Subscribe to job status updates (realtime)
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
          situationId: data.situationId,
          queuePosition: data.queuePosition,
          prompt: data.prompt,
        });
      }
    }, (error) => {
      console.error('Job subscription error:', error);
    });
  }
};

// Alias for backward compatibility
export const archetypeImageApi = {
  ...imageGenerationApi,
  uploadImage: (id: string, file: File) => imageGenerationApi.uploadImage(id, file, 'archetype-images'),
  generateImage: imageGenerationApi.generateArchetypeImage,
};
