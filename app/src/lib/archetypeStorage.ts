// Archetype storage utility - persists archetype data in localStorage

export interface StoredArchetype {
  // The friendly archetype name like "Lone Wolf"
  name: string;
  // Attachment styles used for calculation
  primaryTerrain: string;
  secondaryTerrain?: string;
  // Archetype display data
  imageUrl?: string;
  description?: string;
  // Profile data for prompts
  profileData: {
    coreRecognition: string;
    protectiveLogic: string;
    costUnderStress: string;
    repulsionDisavowal: string;
  };
  scores?: Record<string, number>;
  answers?: Record<string, number>;
  calculatedAt: string;
}

const ARCHETYPE_KEY = 'user_archetype';
const ANSWERS_KEY = 'user_answers';

/**
 * Store archetype data in localStorage
 */
export function saveArchetype(archetype: Omit<StoredArchetype, 'calculatedAt'>, answers?: Record<string, number>): void {
  const data: StoredArchetype = {
    ...archetype,
    answers,
    calculatedAt: new Date().toISOString()
  };
  localStorage.setItem(ARCHETYPE_KEY, JSON.stringify(data));
  
  // Also store answers separately for easy access
  if (answers) {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  }
}

/**
 * Get stored archetype from localStorage
 */
export function getStoredArchetype(): StoredArchetype | null {
  try {
    const data = localStorage.getItem(ARCHETYPE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Get stored answers from localStorage
 */
export function getStoredAnswers(): Record<string, number> | null {
  try {
    const data = localStorage.getItem(ANSWERS_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user has a stored archetype
 */
export function hasStoredArchetype(): boolean {
  return localStorage.getItem(ARCHETYPE_KEY) !== null;
}

/**
 * Clear stored archetype (for retaking assessment)
 */
export function clearStoredArchetype(): void {
  localStorage.removeItem(ARCHETYPE_KEY);
  localStorage.removeItem(ANSWERS_KEY);
}
