import { CASConfiguration } from "../types";

export function validateConfig(config: CASConfiguration): void {
  const questionIds = new Set(config.questions.map(q => q.id));
  const scaleIds = new Set(config.scales.map(s => s.id));

  // Validate Questions
  config.questions.forEach(q => {
    if (!q.id) throw new Error(`Question missing ID: ${JSON.stringify(q)}`);
  });

  // Validate Scales
  config.scales.forEach(scale => {
    if (!scale.id) throw new Error(`Scale missing ID: ${JSON.stringify(scale)}`);
    
    // Check targetQuestionIds
    scale.calculation.targetQuestionIds.forEach(qId => {
      if (!questionIds.has(qId)) {
        throw new Error(`Scale ${scale.id} references missing question ID: ${qId}`);
      }
    });

    // Check ranges (optional: check for overlaps or gaps)
    // For now, just ensure ranges exist
    if (!scale.ranges || scale.ranges.length === 0) {
      throw new Error(`Scale ${scale.id} has no ranges defined`);
    }
  });

  // Validate Archetypes
  config.archetypes.forEach(arch => {
    if (!arch.id) throw new Error(`Archetype missing ID: ${JSON.stringify(arch)}`);

    arch.triggerRules.conditions.forEach(condition => {
      if (condition.scaleId && !scaleIds.has(condition.scaleId)) {
        throw new Error(`Archetype ${arch.id} references missing scale ID: ${condition.scaleId}`);
      }
      if (condition.questionId && !questionIds.has(condition.questionId)) {
        throw new Error(`Archetype ${arch.id} references missing question ID: ${condition.questionId}`);
      }
    });
  });
}
