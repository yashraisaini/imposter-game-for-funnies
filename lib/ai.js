// Uses Google Gemini's free tier (no billing required) to generate word pairs
// for free-text topics. Get a key at https://aistudio.google.com/apikey
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const NICHE_GUIDANCE = {
  broad: "Keep both words broadly, universally well-known — something a random stranger of any age would instantly recognize. Avoid anything specialized.",
  specific: "Pick words a step more specific than the most obvious choice — familiar to anyone reasonably engaged with this topic, but not the first two words everyone would think of.",
  niche: "Go deep. Pick words that only people who are genuinely into this topic would know well — specific enough that a casual outsider might not recognize either word. Still keep the imposter word plausibly bluffable.",
};

const PAIRING_RULE =
  "Critical: the imposter word must NOT be a near-synonym, sub-type, or trivially " +
  "interchangeable stand-in for the civilian word (e.g. don't pair Pizza with Calzone, or " +
  "Lion with Tiger-type substitutes) — that makes bluffing too easy and gives it away. " +
  "Instead pick something a real step removed: a different item from the same broader world " +
  "that shares SOME surface-level traits but would make a listener's specific descriptions " +
  "diverge if either player got too detailed. The imposter should have to genuinely listen and " +
  "improvise, not just describe their word as if it were the same thing.";

// Given ANY free-text topic, ask Gemini for a related pair of words:
// the civilian word everyone (but the imposter) sees, and a "sibling"
// word that's related but clearly different, for the imposter.
// `niche` controls how obscure/specific the pair should be: "broad" | "specific" | "niche".
// Falls back to the curated bank if no API key is configured or the call fails.
export async function generateWordPair(topic, niche = "specific") {
  if (!GEMINI_API_KEY) {
    return fallback(topic);
  }

  const guidance = NICHE_GUIDANCE[niche] || NICHE_GUIDANCE.specific;

  try {
    const prompt = `You are generating word pairs for a party game called "Imposter". Topic: "${topic}".

Give me one "civilian word" (a noun within this topic) and one "imposter word" that is clearly DIFFERENT but closely related enough that someone who only knows the imposter word could plausibly bluff their way through a conversation about the civilian word without being caught immediately.

Specificity level: ${guidance}

${PAIRING_RULE}

Respond with ONLY raw JSON, no markdown, no preamble, in exactly this shape:
{"civilian":"word or short phrase","imposter":"word or short phrase"}`;

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // thinkingBudget: 0 — this model reasons by default, which otherwise
        // burns the whole token budget before writing any actual output.
        generationConfig: { maxOutputTokens: 100, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });

    if (!res.ok) throw new Error(`Gemini request failed: ${res.status}`);

    const data = await res.json();
    const text = (data.candidates?.[0]?.content?.parts?.[0]?.text || "")
      .trim()
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    const parsed = JSON.parse(text);
    if (!parsed.civilian || !parsed.imposter) throw new Error("bad shape");
    return { civilian: parsed.civilian, imposter: parsed.imposter, source: "ai" };
  } catch (err) {
    return fallback(topic);
  }
}

// Used only when there's no API key or the AI call fails. Deliberately NOT
// drawn from the themed preset categories (Clash Royale, Soccer Players, etc.)
// — picking a random unrelated theme there would be more misleading than a
// plain generic pair, since it has nothing to do with what was typed in.
const GENERIC_FALLBACK_PAIRS = [
  ["Coffee", "Tea"],
  ["Backpack", "Suitcase"],
  ["Guitar", "Piano"],
  ["Bicycle", "Skateboard"],
  ["Candle", "Lightbulb"],
  ["Umbrella", "Raincoat"],
  ["Notebook", "Sketchpad"],
  ["Campfire", "Fireplace"],
];

function fallback(topic) {
  const pair = GENERIC_FALLBACK_PAIRS[Math.floor(Math.random() * GENERIC_FALLBACK_PAIRS.length)];
  return { civilian: pair[0], imposter: pair[1], source: "fallback" };
}
