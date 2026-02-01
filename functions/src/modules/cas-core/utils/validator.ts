import { CASConfiguration } from "../types";

export function validateConfig(config: CASConfiguration): void {
  // Validate Questions
  config.questions.forEach(q => {
    if (!q.id) throw new Error(`Question missing ID: ${JSON.stringify(q)}`);
    if (q.options.length !== 4) {
      throw new Error(`Question ${q.id} must have exactly 4 options`);
    }
    
    // Ensure all terrains are covered
    const terrains = new Set(q.options.map(o => o.terrain));
    if (terrains.size !== 4) {
      throw new Error(`Question ${q.id} must have unique terrain options`);
    }
  });

  // Validate Archetypes
  config.archetypes.forEach(arch => {
    if (!arch.id) throw new Error(`Archetype missing ID: ${JSON.stringify(arch)}`);
    if (!arch.primaryTerrain) throw new Error(`Archetype ${arch.id} missing primary terrain`);
  });
}
