import { TerrainType, ScoringResult, ScoringConfig, CASConfiguration, Question, Answers, RankedAnswer } from "../types";

/**
 * Default scoring configuration — matches the original hardcoded values.
 * Used as fallback when config.scoringConfig is undefined.
 */
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  firstChoicePoints: 2,
  secondChoicePoints: 1,
  legacyChoicePoints: 1,

  terrainPriority: {
    Disorganized: 4,
    Anxious: 3,
    Avoidant: 2,
    Secure: 1,
  },

  secureThresholdRanked: 12,
  secureThresholdSimple: 6,
  oscillationThresholdRanked: 6,
  oscillationThresholdSimple: 3,
  repulsionFlagThreshold: 4,

  dominanceRatioThreshold: 0.6,

  archetypeMapping: {
    Disorganized: "mystery_mosaic",
    Secure: "grounded_navigator",
    Anxious: {
      Secure: "emotional_enthusiast",
      Avoidant: "passionate_pilgrim",
      Disorganized: "heartfelt_defender",
      Anxious: "emotional_enthusiast",
    },
    Avoidant: {
      Secure: "lone_wolf",
      Anxious: "independent_icon",
      Disorganized: "chill_conductor",
      Avoidant: "lone_wolf",
    },
  },
};

/**
 * Check if an answer is a ranked answer (V2) or simple answer (legacy)
 */
function isRankedAnswer(answer: string | RankedAnswer): answer is RankedAnswer {
  return typeof answer === 'object' && 'first' in answer && 'second' in answer;
}

/**
 * Calculate terrain scores and determine archetype from quiz answers.
 * 
 * All scoring rules are read from config.scoringConfig.
 * If scoringConfig is absent, DEFAULT_SCORING_CONFIG is used.
 * 
 * Scoring Rules (V2 Ranked Choice):
 * - 1st choice ("Most like me"): +firstChoicePoints
 * - 2nd choice ("Next most like me"): +secondChoicePoints
 * - Repulsion ("Least like me"): Tracked separately as orthogonal signal
 * 
 * Legacy Support:
 * - Simple answers (single optionId): +legacyChoicePoints each
 * 
 * Overrides:
 * - Disorganized override if high Anxious + Avoidant (hidden oscillation)
 * - Secure-first flag if Secure is dominant
 * 
 * Tie-breaking uses terrainPriority from config.
 */
export function calculateTerrainScore(
  answers: Answers,
  config: CASConfiguration
): ScoringResult {
  const sc = config.scoringConfig || DEFAULT_SCORING_CONFIG;

  const scores: Record<TerrainType, number> = {
    Anxious: 0,
    Avoidant: 0,
    Secure: 0,
    Disorganized: 0
  };

  const repulsionScores: Record<TerrainType, number> = {
    Anxious: 0,
    Avoidant: 0,
    Secure: 0,
    Disorganized: 0
  };

  const flags: string[] = [];

  // Build question lookup map
  const questionMap = new Map<string, Question>();
  config.questions.forEach(q => questionMap.set(q.id, q));

  // Helper to get terrain from optionId
  const getTerrainForOption = (questionId: string, optionId: string): TerrainType | null => {
    const question = questionMap.get(questionId);
    if (!question) return null;
    const option = question.options.find(o => o.id === optionId);
    return option?.terrain || null;
  };

  // Tally Points
  Object.entries(answers).forEach(([questionId, answer]) => {
    if (isRankedAnswer(answer)) {
      // V2 Ranked Choice Scoring
      const firstTerrain = getTerrainForOption(questionId, answer.first);
      const secondTerrain = getTerrainForOption(questionId, answer.second);
      const repulsionTerrain = getTerrainForOption(questionId, answer.repulsion);

      if (firstTerrain) scores[firstTerrain] += sc.firstChoicePoints;
      if (secondTerrain) scores[secondTerrain] += sc.secondChoicePoints;
      if (repulsionTerrain) repulsionScores[repulsionTerrain] += 1;
    } else {
      // Legacy single-choice scoring
      const terrain = getTerrainForOption(questionId, answer);
      if (terrain) scores[terrain] += sc.legacyChoicePoints;
    }
  });

  // Sort terrains by score (descending), with tie-breaking priority from config
  const sortedTerrains = (Object.keys(scores) as TerrainType[]).sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return (sc.terrainPriority[b] || 0) - (sc.terrainPriority[a] || 0);
  });

  let primaryTerrain = sortedTerrains[0];
  const secondaryTerrain = sortedTerrains[1];

  // Apply Overrides

  // Check for ranked choice mode (max possible score is 16 with 8 questions × 2 points)
  const maxScore = Math.max(...Object.values(scores));
  const isRankedMode = maxScore > 8;

  // Secure-First Override: Flag if Secure is dominant
  const secureThreshold = isRankedMode ? sc.secureThresholdRanked : sc.secureThresholdSimple;
  if (scores.Secure >= secureThreshold) {
    flags.push("confirmed_secure");
  }

  // Disorganized Override (Hidden Fragmentation):
  // High Anxious AND high Avoidant suggests oscillation pattern
  const oscillationThreshold = isRankedMode ? sc.oscillationThresholdRanked : sc.oscillationThresholdSimple;
  if (scores.Anxious >= oscillationThreshold && scores.Avoidant >= oscillationThreshold) {
    flags.push("hidden_disorganized");
    primaryTerrain = "Disorganized";
  }

  // Repulsion-based flags
  const maxRepulsion = Math.max(...Object.values(repulsionScores));
  if (maxRepulsion >= sc.repulsionFlagThreshold) {
    const highRepulsion = (Object.entries(repulsionScores) as [TerrainType, number][])
      .filter(([, count]) => count >= sc.repulsionFlagThreshold)
      .map(([terrain]) => terrain);

    if (highRepulsion.length > 0) {
      flags.push(`strong_repulsion_${highRepulsion[0].toLowerCase()}`);
    }
  }

  // Check for consistency patterns
  const totalAnswers = Object.keys(answers).length;
  if (totalAnswers === 8) {
    // Full assessment completed
    flags.push("complete_assessment");

    // Check for high consistency (one terrain dominates)
    const dominanceRatio = scores[primaryTerrain] / (isRankedMode ? 24 : 8);
    if (dominanceRatio >= sc.dominanceRatioThreshold) {
      flags.push("high_consistency");
    }
  }

  // Archetype Mapping from config
  let archetypeId: string | undefined;
  const mapping = sc.archetypeMapping[primaryTerrain];

  if (typeof mapping === 'string') {
    // Direct mapping (e.g., Disorganized → mystery_mosaic)
    archetypeId = mapping;
  } else if (mapping && typeof mapping === 'object') {
    // Lookup by secondary terrain
    archetypeId = mapping[secondaryTerrain];
  }

  const archetype = config.archetypes.find(a => a.id === archetypeId) || null;

  return {
    primaryTerrain,
    secondaryTerrain,
    archetype,
    flags,
    scores,
    repulsionScores,
    rawAnswers: answers
  };
}
