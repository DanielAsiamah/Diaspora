import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../../theme';
import LanguageMascot from './LanguageMascot';
import MascotSpeechBubble from './MascotSpeechBubble';
import VocabularyCard from './VocabularyCard';

function titleCase(value = '') {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function TeachingSlide({
  languageId,
  topic,
  items,
  getAudioSource,
  progress,
  onExit,
  onContinue,
}) {
  const lessonTopic = titleCase(topic || 'today');

  return (
    <View style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Exit lesson"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onExit}
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
        >
          <Text style={styles.closeButtonText}>x</Text>
        </Pressable>
        <View style={styles.lessonProgressTrack}>
          <View style={[styles.lessonProgressFill, { width: `${Math.max(progress * 100, 10)}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mascotRow}>
          <LanguageMascot languageId={languageId} size={0.92} />
          <MascotSpeechBubble eyebrow="Before we quiz">
            {`Today we are learning ${lessonTopic.toLowerCase()}. Listen first, then you will practice.`}
          </MascotSpeechBubble>
        </View>

        <View style={styles.explainCard}>
          <Text style={styles.explainTitle}>Learn these first</Text>
          <Text style={styles.explainBody}>
            Tap audio when it is available, say it out loud, then notice the meaning.
          </Text>
        </View>

        <View style={styles.vocabList}>
          {items.map((item, index) => (
            <VocabularyCard
              key={`${item.id || item.phrase}-${index}`}
              item={item}
              index={index}
              audioSource={getAudioSource(item)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={onContinue} style={({ pressed }) => [styles.continueButton, pressed && styles.continuePressed]}>
          <Text style={styles.continueText}>CONTINUE</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#140F0C',
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#2B211B',
    borderColor: '#4A3529',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  closeButtonPressed: {
    opacity: 0.65,
  },
  closeButtonText: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 25,
    lineHeight: 27,
  },
  lessonProgressTrack: {
    backgroundColor: '#33261F',
    borderRadius: radius.pill,
    flex: 1,
    height: 18,
    overflow: 'hidden',
  },
  lessonProgressFill: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    height: '100%',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 150,
  },
  mascotRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  explainCard: {
    backgroundColor: 'rgba(244, 185, 66, 0.1)',
    borderColor: 'rgba(244, 185, 66, 0.25)',
    borderRadius: radius.xl,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  explainTitle: {
    color: colors.accent,
    fontFamily: fonts.black,
    fontSize: 18,
  },
  explainBody: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  vocabList: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  footer: {
    backgroundColor: '#1E1612',
    borderTopColor: '#2E221B',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: spacing.lg,
    position: 'absolute',
    right: 0,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderBottomColor: colors.primaryDark,
    borderBottomWidth: 5,
    borderRadius: radius.lg,
    minHeight: 58,
    justifyContent: 'center',
  },
  continuePressed: {
    borderBottomWidth: 2,
    transform: [{ translateY: 3 }],
  },
  continueText: {
    color: '#102014',
    fontFamily: fonts.black,
    fontSize: 16,
    letterSpacing: 1,
  },
});
