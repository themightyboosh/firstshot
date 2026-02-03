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
  primaryTerrain: TerrainType | 'Disorganized';
  secondaryTerrain: TerrainType | null;
  profileData: ArchetypeProfile;
  description?: string;
  imageUrl?: string;
  imageDescription?: string;
}

/**
 * Answer format for ranked choice assessment.
 * Each question captures three selections:
 * - first: "Most like me" (+2 points)
 * - second: "Next most like me" (+1 point)
 * - repulsion: "Least like me" (tracked separately)
 */
export interface RankedAnswer {
  first: string;   // optionId - Most like me (+2 points)
  second: string;  // optionId - Next most like me (+1 point)
  repulsion: string; // optionId - Least like me (repulsion signal)
}

/**
 * Answers can be either:
 * - Simple: questionId -> optionId (legacy single-choice)
 * - Ranked: questionId -> RankedAnswer (V2 ranked choice)
 */
export type Answers = Record<string, string | RankedAnswer>;

export interface ScoringResult {
  primaryTerrain: TerrainType;
  secondaryTerrain: TerrainType;
  archetype: Archetype | null;
  flags: string[];
  scores: Record<TerrainType, number>;
  repulsionScores: Record<TerrainType, number>;
  rawAnswers?: Answers;
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

export interface Affect {
  id: string;
  name: string;
  description: string;
  interactionGuidance: string;
  iconUrl: string;
}
