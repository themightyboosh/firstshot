import { Affect } from "../cas-core/types";

export const defaultAffects: Affect[] = [
  {
    id: "startled",
    name: "Startled",
    description: "This shows up as a sudden pause or freeze. The person might stop mid-sentence, blink quickly, widen their eyes, or go quiet for a moment. It feels like the interaction briefly knocked them off balance. The vibe isn’t emotional yet, just interrupted.",
    interactionGuidance: "Slow everything down. Pause, soften your voice, and reduce stimulation. Don’t rush to explain, joke, or ask questions. Give them a moment to reorient before continuing. Avoid interpreting the pause as rejection or disinterest. Once they settle, let the conversation resume naturally instead of forcing momentum.",
    iconUrl: "https://realness-score.web.app/affect-icons/surprise.png"
  },
  {
    id: "warmth",
    name: "Warmth",
    description: "Warmth feels open and relaxed. The person smiles easily, laughs, and seems comfortable being present. Their body language is loose, and the interaction feels safe and mutually enjoyable.",
    interactionGuidance: "Protect the ease of the moment. Stay present, mirror their tone lightly, and avoid sudden intensity or pressure. Don’t rush outcomes or test the connection. Small, natural steps forward work better than big moves. Let the interaction breathe and deepen on its own.",
    iconUrl: "https://realness-score.web.app/affect-icons/joy.png"
  },
  {
    id: "curiosity",
    name: "Curiosity",
    description: "Curiosity feels alert and engaged. They lean in, ask questions, follow details, and stay mentally present. The vibe is energized and focused, with a sense of wanting to know more.",
    interactionGuidance: "Feed the interest without overwhelming it. Share, ask, and explore at a steady pace. Avoid dominating the interaction or jumping too far ahead emotionally. Keep things balanced and responsive so curiosity stays alive rather than turning into pressure or fatigue.",
    iconUrl: "https://realness-score.web.app/affect-icons/interest.png"
  },
  {
    id: "frustration",
    name: "Frustration",
    description: "Frustration feels tight and irritated. The person may sound impatient, clipped, or restless. Their body language shows tension, and the vibe suggests something isn’t working or feels blocked.",
    interactionGuidance: "Lower the intensity first. Don’t argue, correct, or rush to fix. Acknowledge the tension and give it space to settle. Stay calm and grounded. Once the edge softens, clarity and problem-solving become possible. Meeting frustration with steadiness helps it pass.",
    iconUrl: "https://realness-score.web.app/affect-icons/anger.png"
  },
  {
    id: "fear",
    name: "Fear",
    description: "Fear shows up as contraction or withdrawal. The person may pull back, go quiet, become hyper-aware, or seem eager to escape the situation. The vibe feels unsafe or pressured.",
    interactionGuidance: "Reduce pressure immediately. Slow down, soften your presence, and remove any sense of demand. Don’t push closeness, answers, or reassurance. Safety comes from predictability and respect, not convincing. If fear doesn’t ease, give space without resentment.",
    iconUrl: "https://realness-score.web.app/affect-icons/fear.png"
  },
  {
    id: "heaviness",
    name: "Heaviness",
    description: "Heaviness feels slow and weighted. The person seems emotionally burdened, tired, or subdued. Their energy drops, and the interaction feels quieter and more inward.",
    interactionGuidance: "Meet heaviness with patience. Don’t rush cheerfulness or solutions. Stay present, listen, and allow pauses. Gentle acknowledgment helps more than advice. Let the pace be slower and follow their lead. Trying to lift the mood too fast can deepen withdrawal.",
    iconUrl: "https://realness-score.web.app/affect-icons/sadness.png"
  },
  {
    id: "revulsion",
    name: "Revulsion",
    description: "Revulsion feels like a strong push away. The person may physically recoil, grimace, or emotionally shut down. The vibe is clear rejection, often sharp and immediate.",
    interactionGuidance: "Stop and create distance. Do not explain, persuade, or press forward. Respect the boundary instantly. Pull back cleanly and calmly. Attempting to override this response damages trust and escalates discomfort. Distance is the correct move.",
    iconUrl: "https://realness-score.web.app/affect-icons/disgust.png"
  },
  {
    id: "aversion",
    name: "Aversion",
    description: "Aversion is subtle withdrawal. The person leans away, disengages slightly, or shows quiet disinterest. The vibe is a soft ‘no’ rather than a sharp rejection.",
    interactionGuidance: "Ease off without drama. Reduce intensity, change topics, or give space. Don’t demand clarity or push engagement. Respecting the subtle signal often preserves dignity and prevents escalation into stronger rejection.",
    iconUrl: "https://realness-score.web.app/affect-icons/withdrawing.png"
  },
  {
    id: "shame",
    name: "Shame",
    description: "Shame feels like collapse or shrinking. The person avoids eye contact, goes quiet, fidgets, or seems suddenly self-conscious. The vibe is ‘don’t look at me’ rather than anger or fear.",
    interactionGuidance: "Remove attention and pressure. Do not spotlight the moment or ask for explanation. Normalize the situation indirectly by shifting focus or softening the interaction. Gentle neutrality helps restore safety. Pushing reassurance or analysis can deepen the shutdown.",
    iconUrl: "https://realness-score.web.app/affect-icons/dropping.png"
  }
];
