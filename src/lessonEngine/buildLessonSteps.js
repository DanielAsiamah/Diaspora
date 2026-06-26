import { LESSON_STEP_TYPES } from './lessonStepTypes';
import { hasVocabImageSource } from '../data/generatedImageRegistry';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export function normaliseStepAnswer(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9' ]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordsFromAnswer(answer) {
  return answer
    .replace(/[?!.,/]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function choiceSet(answer, alternatives) {
  return shuffle(uniqueValues([answer, ...alternatives]).slice(0, 3));
}

function wordBank(answer, alternatives) {
  const answerWords = wordsFromAnswer(answer);
  const answerKeys = answerWords.map((word) => word.toLowerCase());
  const extras = alternatives
    .flatMap(wordsFromAnswer)
    .filter((word) => !answerKeys.includes(word.toLowerCase()));

  return shuffle([...answerWords, ...uniqueValues(extras).slice(0, Math.max(2, 7 - answerWords.length))]);
}

function getSourcePool(lesson, phrasePool = []) {
  const usablePool = phrasePool.filter((item) => item.type !== 'chest' && item.phrase && item.meaning);
  return usablePool.length ? usablePool : [lesson].filter(Boolean);
}

function createImageChoiceStep(target, sourcePool = []) {
  if (!target?.imageKey || !hasVocabImageSource(target.imageKey, target.category)) {
    return null;
  }

  const candidates = sourcePool
    .filter((item) => item?.meaning && item?.imageKey && hasVocabImageSource(item.imageKey, item.category));
  const sameCategory = candidates.filter((item) => item.category === target.category);
  const choicePool = sameCategory.length >= 4 ? sameCategory : candidates;
  const otherChoices = choicePool.filter((item) => item.id !== target.id);

  if (otherChoices.length < 3) {
    return null;
  }

  const choices = shuffle([target, ...shuffle(otherChoices).slice(0, 3)])
    .map((item) => ({
      value: item.meaning,
      imageKey: item.imageKey,
      category: item.category,
    }));

  return {
    id: 'image-choice',
    type: LESSON_STEP_TYPES.IMAGE_CHOICE,
    title: 'Select the correct image',
    prompt: target.phrase,
    answer: target.meaning,
    imageChoices: choices,
    audioKey: target.audioKey,
    note: target.note,
  };
}

function createFirstAvailableImageChoiceStep(sourcePool = [], startIndex = 0) {
  for (let offset = 0; offset < sourcePool.length; offset += 1) {
    const item = sourcePool[(startIndex + offset) % sourcePool.length];
    const step = createImageChoiceStep(item, sourcePool);
    if (step) return step;
  }

  return null;
}

function createMatchPairsStep(sourcePool = [], startIndex = 0) {
  const pairs = [0, 1, 2, 3]
    .map((offset) => sourcePool[(startIndex + offset) % sourcePool.length])
    .filter((item) => item?.phrase && item?.meaning)
    .map((item) => ({
      id: item.id,
      left: item.phrase,
      right: item.meaning,
      audioKey: item.audioKey,
    }));

  if (pairs.length < 3) return null;

  return {
    id: 'match-pairs',
    type: LESSON_STEP_TYPES.MATCH_PAIRS,
    title: 'Match each phrase',
    prompt: 'Tap a phrase, then its meaning',
    answer: '__matched__',
    pairs,
    leftItems: shuffle(pairs.map((pair) => ({ id: pair.id, value: pair.left, pairId: pair.id, audioKey: pair.audioKey }))),
    rightItems: shuffle(pairs.map((pair) => ({ id: `${pair.id}-meaning`, value: pair.right, pairId: pair.id }))),
  };
}

export function createTeachingItems(lesson, phrasePool = []) {
  if (!lesson) return [];

  const sourcePool = getSourcePool(lesson, phrasePool);
  const startIndex = Math.max(0, sourcePool.findIndex((item) => item.id === lesson.id));

  return [0, 1, 2]
    .map((offset) => sourcePool[(startIndex + offset) % sourcePool.length])
    .filter(Boolean);
}

const languageCultureFacts = {
  patois: [
    'Jamaican Patois grew from contact between English and West African languages, then kept changing through everyday Jamaican life.',
    'Jamaica has given the world reggae, dancehall, sprinting legends, bold food culture and everyday phrases people recognise far beyond the island.',
    'In casual Jamaican speech, greetings can carry warmth, respect and relationship. Tone matters as much as the words.',
  ],
  swahili: [
    'Swahili is spoken across East Africa and carries influences from African languages, Arabic and Indian Ocean trade.',
    'A greeting can be more than hello in Swahili. It often opens a polite social exchange.',
  ],
  igbo: [
    'Igbo is a major language of southeastern Nigeria, with many dialects and strong oral storytelling traditions.',
    'In Igbo culture, greetings can show respect, age awareness and community connection.',
  ],
  wolof: [
    'Wolof is widely spoken in Senegal and The Gambia, and greetings are an important part of everyday politeness.',
    'A Wolof greeting can turn into a short conversation because checking on people matters.',
  ],
  haitian: [
    'Haitian Creole is a full language with French influence and deep African language roots.',
    'Haitian Creole carries history, identity and everyday creativity in the way people speak.',
  ],
  belizean: [
    'Belizean Creole reflects Belize history, Caribbean culture and contact between many communities.',
    'Belize is multilingual, so many speakers move naturally between Creole, English and other languages.',
  ],
  aave: [
    'AAVE has its own grammar, sound patterns and history. It is not broken English.',
    'AAVE has shaped music, comedy, internet language and global pop culture in powerful ways.',
  ],
};

function pronunciationFromNote(note) {
  if (!note) return '';
  return note.replace(/^Pronounced:\s*/i, '').trim();
}

function getCultureFact(languageId, index) {
  const facts = languageCultureFacts[languageId] || [
    'Every language carries culture, history and identity. Learning the phrase also means learning the people behind it.',
  ];
  return facts[index % facts.length];
}

function createCorrectCutsceneStep(lesson, phrasePool, languageId, completedStep) {
  const teachingItems = createTeachingItems(lesson, phrasePool);
  const item = teachingItems[completedStep % Math.max(teachingItems.length, 1)] || lesson;

  if (completedStep === 0) {
    return {
      type: LESSON_STEP_TYPES.INTRO_CUTSCENE,
      variant: 'fact',
      title: 'Did you know?',
      body: getCultureFact(languageId, completedStep),
    };
  }

  if (completedStep === 1 && item) {
    return {
      type: LESSON_STEP_TYPES.VOCABULARY_CARD,
      variant: 'vocab',
      eyebrow: 'Phrase check',
      phrase: item.phrase,
      pronunciation: pronunciationFromNote(item.note) || 'Listen and repeat',
      body: `${item.phrase} means "${item.meaning}". Try saying it once before the next challenge.`,
      audioKey: item.audioKey,
    };
  }

  if (completedStep === 3) {
    return {
      type: LESSON_STEP_TYPES.INTRO_CUTSCENE,
      variant: 'coach',
      eyebrow: 'Tutor tip',
      title: 'You are building real recall.',
      body: 'First you recognise the phrase. Then you build it yourself. That is how it starts to stick.',
    };
  }

  return {
    type: LESSON_STEP_TYPES.INTRO_CUTSCENE,
    variant: 'fact',
    title: 'Culture note',
    body: getCultureFact(languageId, completedStep),
  };
}

export function createMistakeStep(step, selectedAnswerValue) {
  if (step?.type === LESSON_STEP_TYPES.BUILD_SENTENCE) {
    return {
      type: LESSON_STEP_TYPES.WRONG_ANSWER_FEEDBACK,
      variant: 'coach',
      eyebrow: 'Mistake clinic',
      title: 'Let us rebuild it together.',
      body: `Your answer was "${selectedAnswerValue}". The stronger answer is "${step.answer}". Word order matters here, so try reading it once before moving on.`,
    };
  }

  if (step?.id === 'listen-choice') {
    return {
      type: LESSON_STEP_TYPES.WRONG_ANSWER_FEEDBACK,
      variant: 'fact',
      title: 'Listening tip',
      body: `If you cannot listen right now, use the small arrow under the speaker to reveal the phrase. The correct answer is "${step.answer}".`,
    };
  }

  return {
    type: LESSON_STEP_TYPES.WRONG_ANSWER_FEEDBACK,
    variant: 'coach',
    eyebrow: 'Tutor correction',
    title: 'Good miss. Now you know.',
    body: `You chose "${selectedAnswerValue}". The correct answer is "${step.answer}". Mistakes help your brain notice the difference next time.`,
  };
}

export function shouldShowCutsceneAfterStep(stepIndex, practiceSteps) {
  return stepIndex < practiceSteps.length - 1 && [0, 1, 3, 4].includes(stepIndex);
}

export function getCorrectCutsceneStep(lesson, phrasePool, languageId, completedStep) {
  return createCorrectCutsceneStep(lesson, phrasePool, languageId, completedStep);
}

export function createLessonSteps(lesson, phrasePool = [], languageId = 'patois') {
  if (!lesson) return [];

  const teachingItems = createTeachingItems(lesson, phrasePool);
  const sourcePool = getSourcePool(lesson, phrasePool);
  const startIndex = Math.max(0, sourcePool.findIndex((item) => item.id === lesson.id));
  const pick = (offset) => sourcePool[(startIndex + offset) % sourcePool.length] || lesson;
  const meanings = sourcePool.map((item) => item.meaning);
  const phrases = sourcePool.map((item) => item.phrase);
  const first = pick(0);
  const second = pick(1);
  const third = pick(2);
  const fourth = pick(3);
  const imageChoiceStep = createFirstAvailableImageChoiceStep(sourcePool, startIndex);
  const matchPairsStep = createMatchPairsStep(sourcePool, startIndex);
  const practiceCandidates = [
    {
      id: 'meaning-choice',
      type: LESSON_STEP_TYPES.MULTIPLE_CHOICE,
      title: 'Choose the correct meaning',
      prompt: first.phrase,
      answer: first.meaning,
      choices: choiceSet(first.meaning, meanings.filter((value) => value !== first.meaning)),
      audioKey: first.audioKey,
      note: first.note,
    },
    imageChoiceStep,
    matchPairsStep,
    {
      id: 'reverse-choice',
      type: LESSON_STEP_TYPES.MULTIPLE_CHOICE,
      title: `How do you say "${second.meaning}"?`,
      prompt: second.meaning,
      answer: second.phrase,
      choices: choiceSet(second.phrase, phrases.filter((value) => value !== second.phrase)),
      note: second.note,
    },
    third?.audioKey ? {
      id: 'listen-choice',
      type: LESSON_STEP_TYPES.AUDIO_LISTEN,
      title: 'Listen and choose the meaning',
      prompt: 'Tap the speaker to hear the phrase',
      answer: third.meaning,
      choices: choiceSet(third.meaning, meanings.filter((value) => value !== third.meaning)),
      audioKey: third.audioKey,
      audioLabel: 'Play the phrase',
      note: third.note,
    } : null,
    {
      id: 'build-meaning',
      type: LESSON_STEP_TYPES.BUILD_SENTENCE,
      title: 'Build the English meaning',
      prompt: fourth.phrase,
      answer: fourth.meaning,
      wordBank: wordBank(fourth.meaning, meanings),
      audioKey: fourth.audioKey,
      note: fourth.note,
    },
    {
      id: 'build-phrase',
      type: LESSON_STEP_TYPES.BUILD_SENTENCE,
      title: `Build the ${languageId === 'patois' ? 'Patois' : 'language'} phrase`,
      prompt: first.meaning,
      answer: first.phrase,
      wordBank: wordBank(first.phrase, phrases),
      note: first.note,
    },
    {
      id: 'final-challenge',
      type: LESSON_STEP_TYPES.MULTIPLE_CHOICE,
      title: 'Final challenge',
      prompt: second.phrase,
      answer: second.meaning,
      choices: choiceSet(second.meaning, meanings.filter((value) => value !== second.meaning)),
      audioKey: second.audioKey,
      note: second.note,
    },
  ].filter(Boolean);

  const firstPractice = practiceCandidates[0];
  const flexiblePractice = shuffle(practiceCandidates.slice(1));
  const practiceSteps = [firstPractice, ...flexiblePractice].slice(0, Math.min(7, practiceCandidates.length));

  return [
    {
      type: LESSON_STEP_TYPES.INTRO_CUTSCENE,
      id: 'lesson-intro',
      topic: lesson?.title || lesson?.meaning,
      items: teachingItems,
    },
    ...teachingItems.map((item, index) => ({
      type: LESSON_STEP_TYPES.VOCABULARY_CARD,
      id: `vocabulary-card-${index}`,
      phrase: item.phrase,
      meaning: item.meaning,
      note: item.note,
      audioKey: item.audioKey,
      sourceItem: item,
    })),
    ...practiceSteps,
    {
      type: LESSON_STEP_TYPES.LESSON_COMPLETE,
      id: 'lesson-complete',
    },
  ];
}

export function getPracticeSteps(steps) {
  return steps.filter((step) => [
    LESSON_STEP_TYPES.AUDIO_LISTEN,
    LESSON_STEP_TYPES.BUILD_SENTENCE,
    LESSON_STEP_TYPES.IMAGE_CHOICE,
    LESSON_STEP_TYPES.MATCH_PAIRS,
    LESSON_STEP_TYPES.MULTIPLE_CHOICE,
  ].includes(step.type));
}
