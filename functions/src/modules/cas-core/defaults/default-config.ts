import { CASConfiguration, Archetype } from "../types";

const archetypes: Archetype[] = [
  {
    id: "grounded_navigator",
    name: "Grounded Navigator",
    primaryTerrain: "Secure",
    secondaryTerrain: null,
    profileData: {
      coreRecognition: "When your system is activated, you tend to stay oriented. Feelings move through you without completely taking over, and you’re usually able to stay connected to yourself and to others at the same time. You can feel discomfort without panicking, closeness without losing yourself, and distance without assuming something is wrong.",
      protectiveLogic: "This pattern protects your ability to stay present. Your system has learned that emotions can be felt, named, and responded to without needing to rush, shut down, or perform. Safety comes from flexibility, not control. You don’t rely on one emotion or one strategy to keep you steady.",
      costUnderStress: "Under stress, even this system can tighten. You may become more self-reliant than you realize, delay asking for support, or minimize how much something is affecting you. When pressure is high, you might look fine on the outside while carrying more than you need to alone.",
      repulsionDisavowal: "What tends to feel most “not you” is emotional extremes. Being consumed by panic, shutting down completely, or feeling yanked around by intensity usually feels foreign or unnecessary. Your system resists losing range, even when stress pushes in that direction."
    }
  },
  {
    id: "emotional_enthusiast",
    name: "Emotional Enthusiast",
    primaryTerrain: "Anxious",
    secondaryTerrain: "Secure",
    profileData: {
      coreRecognition: "When your system is activated, you move toward connection fast. You track cues closely, you feel the gap when someone is distant, and your body wants repair now, not later. Your feelings are alive and immediate, and you don’t fake indifference when something matters.",
      protectiveLogic: "This pattern protects closeness. Your system is built to keep bonds warm, to notice disconnection early, and to pull relationships back into contact before distance becomes loss. Caring is not your problem, it’s your strength, and it often helps people feel valued and known.",
      costUnderStress: "Under stress, urgency can take over. You may over-check, over-interpret, or push for reassurance in ways that leave you feeling exposed. When repair is slow, your mind and body can treat it like danger, and it becomes hard to settle even when nothing catastrophic is happening.",
      repulsionDisavowal: "What tends to feel most “not you” is emotional distance. Pulling back, going quiet, or acting like you don’t care can feel unnatural or even cruel. Your system resists detachment because detachment reads as threat."
    }
  },
  {
    id: "passionate_pilgrim",
    name: "Passionate Pilgrim",
    primaryTerrain: "Anxious",
    secondaryTerrain: "Avoidant",
    profileData: {
      coreRecognition: "When your system is activated, you keep caring, even when caring has been painful. You can hold longing without collapsing, and you stay emotionally attached over time. Hope and sadness often sit next to each other in you, which gives your feelings depth and gravity.",
      protectiveLogic: "This pattern protects meaning. Your system preserves connection by holding it internally, through memory, devotion, and endurance. You don’t turn love into a transaction, and you don’t abandon what matters just because it’s complicated or slow to arrive.",
      costUnderStress: "Under stress, you can end up living in the waiting. Joy may feel fragile, and present-moment satisfaction may be hard to trust. You might accept too little for too long, or carry ache quietly until it starts to feel like identity instead of a passing season.",
      repulsionDisavowal: "What tends to feel most “not you” is shallow ease. Quick fixes, light reassurance, or “just move on” energy can feel invalidating. Your system resists anything that suggests your depth is inconvenient or your longing should be erased."
    }
  },
  {
    id: "heartfelt_defender",
    name: "Heartfelt Defender",
    primaryTerrain: "Anxious",
    secondaryTerrain: "Disorganized",
    profileData: {
      coreRecognition: "When your system is activated, you become competent and useful. You move toward the problem, manage the emotion, and try to stabilize the relationship or situation through effort. You often show care by doing, protecting, organizing, and holding the load.",
      protectiveLogic: "This pattern protects connection through reliability. Your system learned that being steady, helpful, and emotionally responsible increases safety. You often keep relationships functioning, and you frequently become the person others lean on when things get messy.",
      costUnderStress: "Under stress, the cost is over-functioning. You may perform strength while feeling alone inside it. You might manage other people’s feelings while neglecting your own, and shame can show up as the sense that you must stay “on” to be worthy of care or closeness.",
      repulsionDisavowal: "What tends to feel most “not you” is raw need. Depending fully, falling apart, or asking without offering anything in return can feel unsafe or irresponsible. Your system resists vulnerability that could leave you exposed or indebted."
    }
  },
  {
    id: "lone_wolf",
    name: "Lone Wolf",
    primaryTerrain: "Avoidant",
    secondaryTerrain: "Secure",
    profileData: {
      coreRecognition: "When your system is activated, you pull inward and regain control through distance. You prefer to process privately, and you often feel safest when you’re not emotionally exposed. You can stay functional and composed even when something is affecting you.",
      protectiveLogic: "This pattern protects autonomy. Your system reduces overwhelm by limiting dependency and keeping your inner world contained. You’re often steady under pressure, good in a crisis, and able to make decisions without getting swept up in relational intensity.",
      costUnderStress: "Under stress, distance can become disconnection. You may downplay needs, delay repair, or go silent in ways that others experience as cold. Over time, you can feel lonely without recognizing it, because your system treats needing as risk.",
      repulsionDisavowal: "What tends to feel most “not you” is emotional pursuit. Reaching repeatedly, insisting on closeness, or asking for reassurance can feel intrusive or destabilizing. Your system resists anything that feels like it will pull you into dependence."
    }
  },
  {
    id: "independent_icon",
    name: "Independent Icon",
    primaryTerrain: "Avoidant",
    secondaryTerrain: "Anxious",
    profileData: {
      coreRecognition: "When your system is activated, you present as self-contained, even when something matters. You value autonomy, competence, and not being affected. Yet underneath, you often track more than you show, and you can feel sharper edges of longing than people would guess.",
      protectiveLogic: "This pattern protects pride and self-definition. Your system keeps you from feeling powerless by maintaining an image of control. You often succeed, lead, and move through the world without asking for much, which can feel like safety on your terms.",
      costUnderStress: "Under stress, the gap between what you feel and what you show can widen. You might dismiss needs, turn vulnerability into performance, or experience resentment when others want more emotional contact than you can tolerate. The hidden cost is feeling unseen while also staying hidden.",
      repulsionDisavowal: "What tends to feel most “not you” is visible dependency. Needing openly, asking repeatedly, or admitting uncertainty can feel humiliating or risky. Your system resists exposure that could threaten dignity or status in your own eyes."
    }
  },
  {
    id: "chill_conductor",
    name: "Chill Conductor",
    primaryTerrain: "Avoidant",
    secondaryTerrain: "Disorganized",
    profileData: {
      coreRecognition: "When your system is activated, you regulate by smoothing intensity. You stay calm, you keep perspective, and you often manage emotion by understanding it. You can sound clear and reasonable even when your body is carrying more underneath.",
      protectiveLogic: "This pattern protects coherence. Your system prevents overwhelm by staying organized, thoughtful, and composed. You’re often good at de-escalation, problem-solving, and making sense of complicated situations without spiraling.",
      costUnderStress: "Under stress, composure can become distance from feeling. You may move quickly into analysis, humor, or or restraint and miss what your body is asking for. Others may feel you’re present but not fully reachable, especially during emotional moments.",
      repulsionDisavowal: "What tends to feel most “not you” is unfiltered intensity. Big emotional displays, messy need, or being overtaken by a feeling can feel unsafe or unnecessary. Your system resists states that threaten control or clarity."
    }
  },
  {
    id: "mystery_mosaic",
    name: "Mystery Mosaic",
    primaryTerrain: "Disorganized",
    secondaryTerrain: null,
    profileData: {
      coreRecognition: "When your system is activated, different parts of you often pull in different directions. You may feel drawn toward closeness and connection, then suddenly need distance. Relief can appear quickly and disappear just as fast. This shifting isn’t random, it’s how your system responds to mixed signals about safety.",
      protectiveLogic: "This pattern protects you from getting stuck in the wrong place emotionally. Your system learned early on that no single strategy was reliable, so it kept several available. Switching helps you avoid overwhelm, loss, or exposure when things start to feel uncertain.",
      costUnderStress: "Under stress, the switching can speed up. You may feel emotionally exhausted, confused, or unsure which feeling to trust. Moments of calm can be interrupted before they settle, and closeness can feel both deeply wanted and deeply unsettling.",
      repulsionDisavowal: "What often feels most “not you” is steady calm. Sustained safety, predictability, or emotional ease can trigger discomfort or suspicion. Your system may interrupt relief not because it wants chaos, but because calm hasn’t always felt safe to trust."
    }
  }
];

// 8 Placeholder Questions (User to fill in via Admin)
const questions = Array.from({ length: 8 }, (_, i) => ({
  id: `q${i + 1}`,
  text: `Terrain Question ${i + 1} (Please Edit)`,
  options: [
    { id: `q${i + 1}_anxious`, text: "Anxious Option", terrain: "Anxious" as const },
    { id: `q${i + 1}_avoidant`, text: "Avoidant Option", terrain: "Avoidant" as const },
    { id: `q${i + 1}_secure`, text: "Secure Option", terrain: "Secure" as const },
    { id: `q${i + 1}_disorganized`, text: "Disorganized Option", terrain: "Disorganized" as const },
  ]
}));

export const defaultConfig: CASConfiguration = {
  meta: {
    version: "3.0.0",
    lastUpdated: new Date().toISOString().split('T')[0],
    name: "Terrain System Configuration"
  },
  questions,
  archetypes
};
