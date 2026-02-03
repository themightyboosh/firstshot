import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';

// API base URL
const API_BASE_URL = 'https://us-central1-realness-score.cloudfunctions.net';

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `API Error: ${response.status}`);
  }
  return response.json();
}

export interface CMSItem {
  id: string;
  title: string;
  copy: string;
  buttonText: string;
  buttonAction: string;
  imageUrl?: string;
  imageDescription?: string;
}

export const cmsApi = {
  getItem: async (id: string): Promise<CMSItem | null> => {
    try {
      const snap = await getDoc(doc(db, 'cms_content', id));
      return snap.exists() ? { id: snap.id, ...snap.data() } as CMSItem : null;
    } catch (error) {
      console.error(`Error fetching CMS item ${id}:`, error);
      return null;
    }
  }
};

export const dataApi = {
  getSituations: async () => {
    const snap = await getDocs(collection(db, 'situations'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  getAffects: async () => {
    const snap = await getDocs(collection(db, 'affects'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  getCASConfig: async () => {
    const snap = await getDoc(doc(db, 'cas_config', 'main'));
    return snap.exists() ? snap.data() : null;
  }
};

export const generationApi = {
  // Construct prompt on client for now (or move to backend later)
  // Actually, runGeminiPrompt takes a raw prompt string.
  // We need to construct it locally using the master template logic, OR create a backend endpoint that does it.
  // For now, I'll assume we construct it locally using the template fetched from Global Settings.
  
  getGlobalSettings: async () => {
    const snap = await getDoc(doc(db, 'global_settings', 'main'));
    return snap.exists() ? snap.data() : null;
  },

  runGemini: (prompt: string) => 
    apiFetch<{ success: boolean; text: string }>('runGeminiPrompt', { 
      method: 'POST', 
      body: JSON.stringify({ prompt }) 
    }),
    
  submitResponse: (payload: any) => 
    apiFetch('submitUserResponse', { 
      method: 'POST', 
      body: JSON.stringify(payload) 
    }),
    
  submitFeedback: (payload: any) => 
    apiFetch('submitFeedback', { 
      method: 'POST', 
      body: JSON.stringify(payload) 
    }),
};
