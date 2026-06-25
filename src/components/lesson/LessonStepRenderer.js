import { Pressable, ScrollView, Text, View } from 'react-native';

import { LESSON_STEP_TYPES } from '../../lessonEngine/lessonStepTypes';
import LessonAudioButton from './LessonAudioButton';

export default function LessonStepRenderer({
  step,
  styles,
  selectedChoice,
  setSelectedChoice,
  builtWords,
  setBuiltWords,
  feedback,
  audioHelperText,
  normaliseAnswer,
  lessonAudioSource,
  onAudioFallbackPress,
}) {
  if (!step) return null;

  const isChoiceStep = [
    LESSON_STEP_TYPES.AUDIO_LISTEN,
    LESSON_STEP_TYPES.IMAGE_CHOICE,
    LESSON_STEP_TYPES.MULTIPLE_CHOICE,
  ].includes(step.type);
  const isBuildStep = step.type === LESSON_STEP_TYPES.BUILD_SENTENCE;

  return (
    <ScrollView contentContainerStyle={styles.lessonContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.lessonTitle}>{step.title}</Text>
      <View style={styles.lessonPromptRow}>
        <View style={styles.speechCard}>
          {lessonAudioSource ? (
            <LessonAudioButton
              key={`${step.id}-${step.audioKey}`}
              label={step.audioLabel || `Play pronunciation for ${step.prompt}`}
              source={lessonAudioSource}
              fallbackText={step.prompt}
              onFallbackPress={onAudioFallbackPress}
              autoPlay
            />
          ) : null}
          <View style={styles.speechTextWrap}>
            <Text style={styles.phraseText}>{step.prompt}</Text>
            <Text style={styles.phraseHint}>
              {isBuildStep ? 'Tap the words in the correct order' : 'Choose one answer'}
            </Text>
          </View>
        </View>
        {audioHelperText ? (
          <View style={styles.audioHelperCard}>
            <Text style={styles.audioHelperTitle}>Can't listen right now?</Text>
            <Text style={styles.audioHelperBody}>{audioHelperText}</Text>
          </View>
        ) : null}
      </View>

      {isChoiceStep ? (
        <View style={styles.choiceList}>
          {step.choices.map((choice) => {
            const selected = selectedChoice === choice;
            const isCorrectAnswer = Boolean(feedback) && normaliseAnswer(choice) === normaliseAnswer(step.answer);
            const isWrongSelection = Boolean(feedback) && selected && !isCorrectAnswer;
            return (
              <Pressable
                key={choice}
                disabled={Boolean(feedback)}
                onPress={() => setSelectedChoice(choice)}
                style={[
                  styles.answerCard,
                  selected && styles.answerCardSelected,
                  isCorrectAnswer && styles.answerCardCorrect,
                  isWrongSelection && styles.answerCardWrong,
                ]}
              >
                <Text style={styles.answerCardText}>{choice}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {isBuildStep ? (
        <View style={styles.buildArea}>
          <View style={styles.answerTray}>
            {builtWords.length === 0 ? (
              <Text style={styles.answerPlaceholder}>Tap words to build your answer</Text>
            ) : (
              builtWords.map((word, index) => (
                <Pressable
                  key={`${word}-${index}`}
                  disabled={Boolean(feedback)}
                  onPress={() => setBuiltWords((words) => words.filter((_, itemIndex) => itemIndex !== index))}
                  style={styles.wordChipSelected}
                >
                  <Text style={styles.wordChipText}>{word}</Text>
                </Pressable>
              ))
            )}
          </View>
          <View style={styles.wordBank}>
            {step.wordBank.map((word, index) => {
              const used = builtWords.includes(word);
              return (
                <Pressable
                  key={`${word}-${index}`}
                  disabled={used || Boolean(feedback)}
                  onPress={() => setBuiltWords((words) => [...words, word])}
                  style={[styles.wordChip, used && styles.wordChipUsed]}
                >
                  <Text style={styles.wordChipText}>{word}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
