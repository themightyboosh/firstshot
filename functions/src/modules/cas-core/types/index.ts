export type TerrainType = 'Anxious' | 'Avoidant' | 'Secure' | 'Disorganized';

export interface QuestionOption {
  id: string;
  text: string;
  terrain: TerrainType;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

export interface ArchetypeProfile {
  coreRecognition: string;
  protectiveLogic: string;
  costUnderStress: string;
  repulsionDisavowal: string;
}

export interface Archetype {
  id: string;
  name: string;
  primaryTerrain: TerrainType | 'Disorganized'; // Disorganized can be primary
  secondaryTerrain: TerrainType | null; // Null for "Pure" types like Secure, Lone Wolf (Avoidant)
  profileData: ArchetypeProfile;
}

export interface ScoringResult {
  primaryTerrain: TerrainType;
  secondaryTerrain: TerrainType;
  archetype: Archetype | null;
  flags: string[];
  scores: Record<TerrainType, number>;
  rawAnswers?: Record<string, string>; // questionId -> optionId
}

export interface CASConfiguration {
  meta: {
    version: string;
    lastUpdated: string;
    name: string;
  };
  questions: Question[];
  archetypes: Archetype[];
}
