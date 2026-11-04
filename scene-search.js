// Finds scenes by what a learner types, most relevant first. A word counts
// when a scene's word starts with it, so "doct" finds "doctor's" but "formal"
// doesn't find "informal".

const TITLE_POINTS = 3;
const KEYWORD_POINTS = 2;
const DESCRIPTION_POINTS = 1;

// Lowercase words without accents or the sentence punctuation around them.
function searchWords(text) {
  return simplifyForSearch(text)
    .split(/\s+/)
    .map((word) => word.replace(/^[.,!?;:"'()¿¡]+|[.,!?;:"'()¿¡]+$/g, ""))
    .filter((word) => word !== "");
}

function sceneRelevance(scene, queryWords) {
  const fields = [
    { points: TITLE_POINTS, words: searchWords(Object.values(scene.title).join(" ")) },
    { points: KEYWORD_POINTS, words: searchWords(scene.keywords.join(" ")) },
    { points: DESCRIPTION_POINTS, words: searchWords(scene.description) },
  ];
  let relevance = 0;
  for (const queryWord of queryWords) {
    const matchingField = fields.find(({ words }) => words.some((word) => word.startsWith(queryWord)));
    relevance += matchingField ? matchingField.points : 0;
  }
  return relevance;
}

// An empty search lists every scene; otherwise only matching scenes, best first.
function searchScenes(scenes, query) {
  if (query.trim() === "") {
    return scenes;
  }
  const queryWords = searchWords(query);
  return scenes
    .map((scene) => ({ scene, relevance: sceneRelevance(scene, queryWords) }))
    .filter(({ relevance }) => relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .map(({ scene }) => scene);
}
