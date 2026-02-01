export interface Question {
  id: string;
  text: string;
  type: string;
  category: string;
  order: number;
  weight: number;
}

export interface ScaleRange {
  id: string;
  min: number;
  max: number;
  label: string;
  description: string;
}

export interface ScaleCalculation {
  method: string;
  targetQuestionIds: string[];
}

export interface Scale {
  id: string;
  name: string;
  description: string;
  calculation: ScaleCalculation;
  ranges: ScaleRange[];
}

export interface ArchetypeRuleCondition {
  scaleId?: string;
  questionId?: string;
  operator: "lt" | "lte" | "gt" | "gte" | "eq";
  value: number;
}

export interface ArchetypeRules {
  operator: "AND" | "OR";
  conditions: ArchetypeRuleCondition[];
}

export interface ArchetypeProfile {
  shortTag: string;
  description: string;
  expandedDescription?: string;
  shadowSide: string;
  growthPath: string;
  strengths: string;
  promptFragment: string;
}

export interface Archetype {
  id: string;
  originalId?: number;
  name: string;
  priority: number;
  triggerRules: ArchetypeRules;
  profileData: ArchetypeProfile;
}

export interface CASContent {
  introText: string;
  completionText: string;
}

export interface CASMeta {
  version: string;
  lastUpdated: string;
  name: string;
}

export interface CASConfiguration {
  meta: CASMeta;
  questions: Question[];
  scales: Scale[];
  archetypes: Archetype[];
  content: CASContent;
}
