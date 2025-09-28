// Lightweight heuristic sentiment/emotion detector
// Returns polarity, coarse emotion, and a confidence score [0,1]

export interface SentimentHints {
    polarity: "positive" | "negative" | "neutral";
    emotion: "joyful" | "stressed" | "sad" | "angry" | "calm" | "neutral";
    confidence: number;
}

const positiveWords = new Set([
    "happy","joy","grateful","excited","proud","calm","peaceful","optimistic","great","good","excellent","amazing","love","loved","progress","energized","relaxed"
]);

const negativeWords = new Set([
    "tired","fatigue","fatigued","exhausted","stressed","stress","anxious","anxiety","worried","overwhelmed","sad","upset","angry","frustrated","burned","burnt","depressed","bad","terrible","awful","hopeless","suicidal"
]);

const angerWords = new Set(["angry","furious","mad","irritated","annoyed","frustrated"]);
const sadnessWords = new Set(["sad","down","depressed","blue","tearful","lonely"]);
const stressWords = new Set(["stressed","anxious","anxiety","overwhelmed","pressure","burned","burnt"]);

// High-priority crisis phrases indicating self-harm or suicide intent
const crisisPhrasePatterns: RegExp[] = [
    /\bsuicide\b/i,
    /\bsuicidal\b/i,
    /\bkill\s+myself\b/i,
    /\bend\s+my\s+life\b/i,
    /\bwant\s+to\s+die\b/i,
    /\bself[-\s]?harm\b/i,
    /\bhurt\s+myself\b/i,
    /\blife\s+is\s+not\s+worth\b/i,
    /\bcan'?t\s+go\s+on\b/i,
];

export function analyzeSentimentHeuristic(text: string): SentimentHints {
    const raw = String(text || "");
    const lower = raw.toLowerCase();
    // Crisis detection first: override with strong negative/sad signal
    for (const re of crisisPhrasePatterns) {
        if (re.test(lower)) {
            return { polarity: "negative", emotion: "sad", confidence: 0.98 };
        }
    }

    const tokens = lower.match(/[a-z']+/g) || [];
    if (tokens.length === 0) {
        return { polarity: "neutral", emotion: "neutral", confidence: 0.2 };
    }

    let pos = 0;
    let neg = 0;
    let anger = 0, sadness = 0, stress = 0;

    for (const tok of tokens) {
        if (positiveWords.has(tok)) pos++;
        if (negativeWords.has(tok)) neg++;
        if (angerWords.has(tok)) anger++;
        if (sadnessWords.has(tok)) sadness++;
        if (stressWords.has(tok)) stress++;
    }

    const score = pos - neg; // rough polarity
    const total = pos + neg;

    let polarity: SentimentHints["polarity"] = "neutral";
    if (score > 1) polarity = "positive";
    else if (score < -1) polarity = "negative";

    let emotion: SentimentHints["emotion"] = "neutral";
    if (stress >= anger && stress >= sadness && stress > 0) emotion = "stressed";
    else if (anger > 0 && anger >= sadness) emotion = "angry";
    else if (sadness > 0) emotion = "sad";
    else if (pos > neg && pos > 0) emotion = "joyful";
    else if (total === 0) emotion = "neutral";
    else emotion = "calm";

    const confidence = Math.min(1, Math.max(0.2, (Math.abs(score) + anger + sadness + stress) / Math.max(5, tokens.length / 20)));

    return { polarity, emotion, confidence: Number(confidence.toFixed(2)) };
}


