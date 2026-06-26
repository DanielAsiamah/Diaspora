// Generated from assets/images/vocab. Do not edit by hand.

const vocabImageSources = {
  "family/brother.png": require("../../assets/images/vocab/family/brother.png"),
  "family/child.png": require("../../assets/images/vocab/family/child.png"),
  "family/father.png": require("../../assets/images/vocab/family/father.png"),
  "family/friend.png": require("../../assets/images/vocab/family/friend.png"),
  "family/grandmother.png": require("../../assets/images/vocab/family/grandmother.png"),
  "family/mother.png": require("../../assets/images/vocab/family/mother.png"),
  "family/sister.png": require("../../assets/images/vocab/family/sister.png"),
  "food/ackee.png": require("../../assets/images/vocab/food/ackee.png"),
  "food/bread.png": require("../../assets/images/vocab/food/bread.png"),
  "food/coffee.png": require("../../assets/images/vocab/food/coffee.png"),
  "food/hungry.png": require("../../assets/images/vocab/food/hungry.png"),
  "food/jerk_chicken.png": require("../../assets/images/vocab/food/jerk_chicken.png"),
  "food/plantain.png": require("../../assets/images/vocab/food/plantain.png"),
  "food/rice_peas.png": require("../../assets/images/vocab/food/rice_peas.png"),
  "food/tea.png": require("../../assets/images/vocab/food/tea.png"),
  "food/water.png": require("../../assets/images/vocab/food/water.png"),
  "greetings/goodbye.png": require("../../assets/images/vocab/greetings/goodbye.png"),
  "greetings/hello.png": require("../../assets/images/vocab/greetings/hello.png"),
  "greetings/morning.png": require("../../assets/images/vocab/greetings/morning.png"),
  "greetings/night.png": require("../../assets/images/vocab/greetings/night.png"),
  "greetings/question.png": require("../../assets/images/vocab/greetings/question.png"),
  "greetings/wave.png": require("../../assets/images/vocab/greetings/wave.png"),
  "greetings/welcome.png": require("../../assets/images/vocab/greetings/welcome.png"),
};

export const vocabImageKeys = Object.freeze(Object.keys(vocabImageSources));

function cleanImageName(value) {
  return String(value ?? '').trim().split(/[\\/]/).pop();
}

function resolveVocabImageKey(imageKey, category) {
  const filename = cleanImageName(imageKey);
  if (!filename) return null;

  const categoryKey = String(category ?? '').trim().toLowerCase();
  if (categoryKey) {
    const exactKey = `${categoryKey}/${filename}`;
    if (vocabImageSources[exactKey]) return exactKey;
  }

  const filenameSuffix = `/${filename}`;
  const matches = vocabImageKeys.filter((key) => key === filename || key.endsWith(filenameSuffix));

  return matches.length === 1 ? matches[0] : null;
}

export function hasVocabImageSource(imageKey, category) {
  return Boolean(resolveVocabImageKey(imageKey, category));
}

export function getVocabImageSource(imageKey, category) {
  const key = resolveVocabImageKey(imageKey, category);
  return key ? vocabImageSources[key] : null;
}
