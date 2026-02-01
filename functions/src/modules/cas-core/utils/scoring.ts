import { TerrainType, ScoringResult, CASConfiguration, Question, Answers, RankedAnswer } from "../types";

/**
 * Check if an answer is a ranked answer (V2) or simple answer (legacy)
 */
function isRankedAnswer(answer: string | RankedAnswer): answer is RankedAnswer {
  return typeof answer === 'object' && 'first' in answer && 'second' in answer;
}

/**
 * Calculate terrain scores and determine archetype from quiz answers.
 * 
 * Scoring Rules (V2 Ranked Choice):
 * - 1st choice ("Most like me"): +2 points
 * - 2nd choice ("Next most like me"): +1 point
 * - Repulsion ("Least like me"): Tracked separately as orthogonal signal
 * 
 * Legacy Support:
 * - Simple answers (single optionId): +1 point each
 * 
 * Overrides:
 * - Disorganized override if high Anxious + Avoidant (hidden oscillation)
 * - Secure-first flag if Secure is dominant
 * 
 * Tie-breaking priority: Disorganized > Anxious > Avoidant > Secure
 */
export function calculateTerrainScore(
  answers: Answers,
  config: CASConfiguration
): ScoringResult {
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

      if (firstTerrain) scores[firstTerrain] += 2;
      if (secondTerrain) scores[secondTerrain] += 1;
      if (repulsionTerrain) repulsionScores[repulsionTerrain] += 1;
    } else {
      // Legacy single-choice scoring (+1 point)
      const terrain = getTerrainForOption(questionId, answer);
      if (terrain) scores[terrain] += 1;
    }
  });

  // Sort terrains by score (descending), with tie-breaking priority
  const terrainPriority: Record<TerrainType, number> = {
    Disorganized: 4,
    Anxious: 3,
    Avoidant: 2,
    Secure: 1
  };

  const sortedTerrains = (Object.keys(scores) as TerrainType[]).sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return terrainPriority[b] - terrainPriority[a];
  });

  let primaryTerrain = sortedTerrains[0];
  const secondaryTerrain = sortedTerrains[1];

  // Apply Overrides

  // Check for ranked choice mode (max possible score is 16 with 8 questions × 2 points)
  const maxScore = Math.max(...Object.values(scores));
  const isRankedMode = maxScore > 8;

  // Secure-First Override: Flag if Secure is dominant
  const secureThreshold = isRankedMode ? 12 : 6; // Adjust for ranked vs simple
  if (scores.Secure >= secureThreshold) {
    flags.push("confirmed_secure");
  }

  // Disorganized Override (Hidden Fragmentation):
  // High Anxious AND high Avoidant suggests oscillation pattern
  const oscillationThreshold = isRankedMode ? 6 : 3;
  if (scores.Anxious >= oscillationThreshold && scores.Avoidant >= oscillationThreshold) {
    flags.push("hidden_disorganized");
    primaryTerrain = "Disorganized";
  }

  // Repulsion-based flags
  const maxRepulsion = Math.max(...Object.values(repulsionScores));
  if (maxRepulsion >= 4) {
    const highRepulsion = (Object.entries(repulsionScores) as [TerrainType, number][])
      .filter(([, count]) => count >= 4)
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
    if (dominanceRatio >= 0.6) {
      flags.push("high_consistency");
    }
  }

  // Archetype Mapping based on Primary + Secondary terrain
  let archetypeId: string | undefined;

  if (primaryTerrain === "Disorganized") {
    archetypeId = "mystery_mosaic";
  } else if (primaryTerrain === "Secure") {
    archetypeId = "grounded_navigator";
  } else if (primaryTerrain === "Anxious") {
    const anxiousArchetypes: Record<TerrainType, string> = {
      Secure: "emotional_enthusiast",
      Avoidant: "passionate_pilgrim",
      Disorganized: "heartfelt_defender",
      Anxious: "emotional_enthusiast"
    };
    archetypeId = anxiousArchetypes[secondaryTerrain];
  } else if (primaryTerrain === "Avoidant") {
    const avoidantArchetypes: Record<TerrainType, string> = {
      Secure: "lone_wolf",
      Anxious: "independent_icon",
      Disorganized: "chill_conductor",
      Avoidant: "lone_wolf"
    };
    archetypeId = avoidantArchetypes[secondaryTerrain];
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
