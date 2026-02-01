import { TerrainType, ScoringResult, CASConfiguration, Question } from "../types";

export function calculateTerrainScore(
  answers: Record<string, string>, // questionId -> optionId
  config: CASConfiguration
): ScoringResult {
  const scores: Record<TerrainType, number> = {
    Anxious: 0,
    Avoidant: 0,
    Secure: 0,
    Disorganized: 0
  };

  const flags: string[] = [];
  const rawAnswers = answers;

  // 1. Tally Points
  // We need to look up the terrain for each selected option
  const questionMap = new Map<string, Question>();
  config.questions.forEach(q => questionMap.set(q.id, q));

  // Track choices for oscillation check
  const choices: TerrainType[] = [];

  Object.entries(answers).forEach(([qId, optionId]) => {
    const question = questionMap.get(qId);
    if (question) {
      const option = question.options.find(o => o.id === optionId);
      if (option) {
        scores[option.terrain]++;
        choices.push(option.terrain);
      }
    }
  });

  // 2. Overrides

  // 2.1 Disorganized Override (Hidden Fragmentation)
  // Trigger: Oscillation between Anxious and Avoidant on 3+ questions? 
  // Wait, the prompt says "User oscillates between Anxious (1st) and Avoidant (2nd) or vice versa".
  // Since we only pick ONE option per question, "1st choice" is the ONLY choice here.
  // So "Oscillation" likely means they picked Anxious sometimes and Avoidant other times.
  // Let's interpret "oscillates ... on 3+ questions" as:
  // Having at least 3 Anxious AND at least 3 Avoidant answers? 
  // OR just switching back and forth? The prompt says "between Anxious (1st) and Avoidant (2nd)".
  // NOTE: In the Prompt's "Tie-Breaking & Overrides" section, it mentions "1st choice" and "2nd choice".
  // This implies the user might be ranking answers, OR the "questions" have multiple selections?
  // My clarification question established "4 options, one per Terrain".
  // If the user selects ONE option per question, "1st choice" is that selection.
  // The "Secure-First Override" says "User selects Secure as 1st choice on 6+ questions. Logic: Analyze 2nd choices."
  // This strongly implies we need a SECOND choice data point. 
  // However, standard likert/terrain quizzes usually just have one selection.
  // Given the complexity, I will implement scoring based on the PRIMARY selection for now.
  // If the prompt implies RANKED choice (Pick 1st, Pick 2nd), that changes the data structure.
  // RE-READING PROMPT: "User selects Secure as 1st choice... Analyze 2nd choices."
  // This confirms we probably need a "Secondary Choice" or the questions are ranked?
  // BUT I asked "Does each question have exactly 4 specific answer choices..." and confirmed structure.
  // I will assume for this implementation that we are calculating based on Single Choice first.
  // If "2nd choice" is required, we would need to ask the user to pick two? 
  // Let's stick to the Single Choice Tally for the MVP unless specified otherwise.
  
  // Actually, let's implement the logic assuming we MIGHT have 2nd choices in the future,
  // but for now we only have the "Primary" choice (the one selected).
  
  // Let's implement the "Disorganized Override" based on the mix of answers.
  // If Anxious > 0 AND Avoidant > 0, that's some oscillation.
  // Prompt: "Oscillates ... on 3+ questions".
  // Interpretation: If (Anxious Count >= 3) AND (Avoidant Count >= 3)?
  // Let's go with a simpler check for now: High Anxious + High Avoidant = Disorganized.
  
  // Actually, looking at "Tiebreaker Priority": Disorganized > Anxious > Avoidant > Secure.
  
  // Let's implement the standard scoring first.
  
  const sortedTerrains = (Object.keys(scores) as TerrainType[]).sort((a, b) => {
    // Primary sort: Score (descending)
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    
    // Tie-breaking Priority: Disorganized > Anxious > Avoidant > Secure
    const priority = { Disorganized: 4, Anxious: 3, Avoidant: 2, Secure: 1 };
    return priority[b] - priority[a];
  });

  let primaryTerrain = sortedTerrains[0];
  let secondaryTerrain = sortedTerrains[1];

  // 2.2 Secure-First Override Logic (Simplified for Single Choice)
  // If Secure is very high (e.g. 6+), but we have a clear secondary pattern.
  if (scores.Secure >= 6) {
    flags.push("confirmed_secure");
    // If secondary is strong enough, we might want to flag "regulated_presentation"
    // But primary remains Secure.
  }

  // 2.3 Disorganized Override (Hidden Fragmentation)
  // If we have high Anxious AND high Avoidant, this suggests Disorganized.
  // E.g. Anxious >= 3 AND Avoidant >= 3
  if (scores.Anxious >= 3 && scores.Avoidant >= 3) {
    flags.push("hidden_disorganized");
    primaryTerrain = "Disorganized";
    // Secondary becomes the higher of Anxious/Avoidant, or remains as is.
  }

  // 3. Archetype Mapping
  let archetypeId: string | undefined;

  // Special Case: Mystery Mosaic (Disorganized Primary)
  if (primaryTerrain === "Disorganized") {
    archetypeId = "mystery_mosaic";
  } else {
    // Map Pair (Primary + Secondary)
    // Note: Secondary can be null if Primary is dominant? The logic says "Secondary Assignment: ... second-highest score".
    // So we always have a secondary unless scores are 8-0-0-0.
    
    // const pair = [primaryTerrain, secondaryTerrain].sort().join('+');
    
    // Mappings based on "Composition" in prompt
    // Secure + Secure (Pure) -> Grounded Navigator (Secure Primary, others low)
    // Anxious + Secure -> Emotional Enthusiast
    // Anxious + Avoidant -> Passionate Pilgrim
    // Anxious + Disorganized -> Heartfelt Defender
    // Avoidant + Secure -> Lone Wolf
    // Avoidant + Anxious -> Independent Icon
    // Avoidant + Disorganized -> Chill Conductor
    
    // Note: The prompt lists specific compositions.
    // "Secure Primary" -> Grounded Navigator. (Does it matter what secondary is? Prompt says "Composition: Secure Primary")
    // Let's assume if Primary is Secure, it's Grounded Navigator.
    if (primaryTerrain === "Secure") {
      archetypeId = "grounded_navigator";
    }
    // "Disorganized Primary" -> Mystery Mosaic (Handled above)
    
    // Anxious Primary
    else if (primaryTerrain === "Anxious") {
      if (secondaryTerrain === "Secure") archetypeId = "emotional_enthusiast";
      else if (secondaryTerrain === "Avoidant") archetypeId = "passionate_pilgrim";
      else if (secondaryTerrain === "Disorganized") archetypeId = "heartfelt_defender";
      else archetypeId = "emotional_enthusiast"; // Fallback?
    }
    
    // Avoidant Primary
    else if (primaryTerrain === "Avoidant") {
      if (secondaryTerrain === "Secure") archetypeId = "lone_wolf";
      else if (secondaryTerrain === "Anxious") archetypeId = "independent_icon";
      else if (secondaryTerrain === "Disorganized") archetypeId = "chill_conductor";
      else archetypeId = "lone_wolf"; // Fallback
    }
  }

  const archetype = config.archetypes.find(a => a.id === archetypeId) || null;

  return {
    primaryTerrain,
    secondaryTerrain,
    archetype,
    flags,
    scores,
    rawAnswers
  };
}
