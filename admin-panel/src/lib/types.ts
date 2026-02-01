// Shared types - mirrored from functions/src/modules/cas-core/types

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
  imageDescription?: string;  // For AI image prompts
  imageUrl?: string;          // Generated or uploaded image URL
  imageJobId?: string;        // BullMQ job ID for pending generation
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

export interface Situation {
  id?: string;
  name: string;
  squarePngUrl: string;
  shortDescription: string;
  longDescription: string;
  promptFragment: string;
}

// Saved configuration set (for Configurations tab)
export interface SavedConfigSet {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  config: CASConfiguration;
}

// Prompt Elements configuration
export interface PromptElementsConfig {
  stylePrompt: string;  // "In the style of..." text for AI prompts
  updatedAt: string;
}
