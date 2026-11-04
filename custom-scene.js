// Scenes a learner invents: writes the request for an AI, turns the AI's reply
// into a scene, and saves those scenes in this browser.

const CUSTOM_SCENES_KEY = "scene-translator-custom-scenes";
const CUSTOM_SPEAKER_COLORS = ["#1971c2", "#d9480f", "#2f9e44", "#9c36b5", "#c2255c", "#0c8599"];
const MAX_CUSTOM_LINES = 100;
const NOT_A_SCENE_MESSAGE = "That doesn't look like a scene. Copy the AI's whole reply and paste it here again.";

// Only some AIs can open with a request already filled in; `promptParameter`
// is how their link carries it. The rest get it from the clipboard.
const AI_CHOICES = [
  { name: "Claude", url: "https://claude.ai/new", promptParameter: "q" },
  { name: "ChatGPT", url: "https://chatgpt.com/", promptParameter: "q" },
  { name: "Gemini", url: "https://gemini.google.com/app" },
  { name: "Another AI" },
];

function aiLink(ai, prompt) {
  return ai.promptParameter ? `${ai.url}?${ai.promptParameter}=${encodeURIComponent(prompt)}` : ai.url;
}

function buildGrammarNote(grammar) {
  if (grammar.length === 0) {
    return "Use a mix of tenses.";
  }
  const futureNote = grammar.includes("future tense")
    ? `\nFuture tense means the verb's own future form, such as Spanish "iré" or French "j'irai", not a "going to" form such as "voy a ir" or "je vais aller". If a language has no such form, use its closest natural equivalent.`
    : "";
  return `Grammar to practice, in most lines: ${grammar.join(", ")}.
Use the actual grammatical form each time, not a different construction with a similar meaning.${futureNote}`;
}

const DEFAULT_SCENE_OPTIONS = { grammar: [], length: "10", level: "intermediate", tone: "any", speakers: "2" };

function buildScenePrompt(situation, firstLanguage, secondLanguage, options = DEFAULT_SCENE_OPTIONS) {
  const languages = [firstLanguage, secondLanguage];
  const languageNames = languages.map((code) => `${LANGUAGES[code].name} ("${code}")`).join(" and ");
  const romanized = languages.filter((code) => LANGUAGES[code].altScript);
  const romanizedNote = romanized
    .map((code) => ` "${LANGUAGES[code].altScript}" is ${LANGUAGES[code].name} in Latin letters.`)
    .join("");
  const lineKeys = [...languages, ...romanized.map((code) => LANGUAGES[code].altScript)]
    .map((key) => `"${key}":["..."]`)
    .join(",");
  const grammarNote = buildGrammarNote(options.grammar);
  const toneNote = options.tone === "any" ? "" : `\nKeep the tone ${options.tone}.`;
  return `Write a natural conversation for someone learning languages.
Situation: ${situation}
Languages: ${languageNames}.${romanizedNote}
Use about ${options.length} lines and ${options.speakers} speakers.
The learner's level is ${options.level}.${toneNote}
${grammarNote}
Give each line as a list: the best translation first, then up to 2 other correct ways to say it.
Reply with only this JSON in a code block:
{"title":"Short title in English","lines":[{"speaker":"Name",${lineKeys}}]}`;
}

// A translation may arrive as one string or a list of accepted answers.
function acceptedAnswers(value) {
  const answers = Array.isArray(value) ? value : [value];
  return answers.filter((answer) => typeof answer === "string" && answer.trim() !== "").map((answer) => answer.trim());
}

function parseReplyJson(reply) {
  try {
    // Chat replies often wrap the JSON in a sentence or a code block.
    return JSON.parse(reply.slice(reply.indexOf("{"), reply.lastIndexOf("}") + 1));
  } catch {
    throw new Error(NOT_A_SCENE_MESSAGE);
  }
}

// Turns an AI's reply into a scene, or throws an error whose message can be
// shown to the learner. Its languages come from the reply, in the order given.
function parseSceneReply(reply) {
  const { title, lines } = parseReplyJson(reply);
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > MAX_CUSTOM_LINES) {
    throw new Error(NOT_A_SCENE_MESSAGE);
  }
  const languages = Object.keys(Object(lines[0]))
    .filter((key) => Object.hasOwn(LANGUAGES, key))
    .slice(0, 2);
  if (languages.length < 2) {
    throw new Error("The AI's reply needs two languages, but this one has fewer.");
  }

  // Speakers get made-up keys because names come from the AI and could be anything.
  const speakers = {};
  const speakerKeys = new Map();
  const speakerKeyFor = (name) => {
    if (!speakerKeys.has(name)) {
      const position = speakerKeys.size;
      const color = CUSTOM_SPEAKER_COLORS[position % CUSTOM_SPEAKER_COLORS.length];
      speakerKeys.set(name, `speaker${position}`);
      speakers[`speaker${position}`] = { name, color };
    }
    return speakerKeys.get(name);
  };

  const sceneLines = lines.map((line, index) => {
    const text = {};
    for (const code of languages) {
      text[code] = acceptedAnswers(Object(line)[code]);
      if (text[code].length === 0) {
        throw new Error(`Line ${index + 1} of the AI's reply is missing its ${LANGUAGES[code].name}.`);
      }
      const romanized = acceptedAnswers(Object(line)[LANGUAGES[code].altScript]);
      if (romanized.length > 0) {
        text[LANGUAGES[code].altScript] = romanized;
      }
    }
    const speakerName = typeof Object(line).speaker === "string" && line.speaker.trim() !== "" ? line.speaker.trim() : "Speaker";
    return { speaker: speakerKeyFor(speakerName), text };
  });

  return {
    id: `custom-${Date.now()}`,
    languages,
    title: { en: typeof title === "string" && title.trim() !== "" ? title.trim() : "My scene" },
    description: "Your own scene.",
    keywords: ["custom", "own"],
    speakers,
    lines: sceneLines,
  };
}

function isUsableScene(scene) {
  return Boolean(scene) && typeof scene.id === "string" && Array.isArray(scene.languages) && Array.isArray(scene.lines) && Boolean(scene.speakers) && Boolean(scene.title);
}

function loadCustomScenes() {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_SCENES_KEY));
    return Array.isArray(saved) ? saved.filter(isUsableScene) : [];
  } catch {
    return [];
  }
}

// Returns whether the save worked; browsers can refuse, as in private windows.
function saveCustomScenes(scenes) {
  try {
    localStorage.setItem(CUSTOM_SCENES_KEY, JSON.stringify(scenes));
    return true;
  } catch {
    return false;
  }
}
