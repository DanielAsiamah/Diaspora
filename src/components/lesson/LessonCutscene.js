import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../../theme';
import LanguageMascot from './LanguageMascot';
import LessonAudioButton from './LessonAudioButton';

export default function LessonCutscene({
  languageId,
  cutscene,
  audioSource,
  progress,
  onExit,
  onContinue,
}) {
  const variant = cutscene?.variant || 'fact';

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
        {variant === 'coach' ? (
          <View style={styles.coachScene}>
            <LanguageMascot languageId={languageId} size={1.25} />
            <Text style={styles.coachEyebrow}>{cutscene.eyebrow || 'Tutor note'}</Text>
            <Text style={styles.coachTitle}>{cutscene.title}</Text>
            <Text style={styles.coachBody}>{cutscene.body}</Text>
          </View>
        ) : null}

        {variant === 'vocab' ? (
          <View style={styles.boardScene}>
            <View style={styles.boardString} />
            <View style={styles.boardPin} />
            <View style={styles.boardCard}>
              <Text style={styles.boardEyebrow}>{cutscene.eyebrow || 'New phrase'}</Text>
              <Text style={styles.boardPhrase}>{cutscene.phrase}</Text>
              <View style={styles.audioRow}>
                <LessonAudioButton
                  compact
                  source={audioSource}
                  label={`Play pronunciation for ${cutscene.phrase}`}
                  fallbackText={cutscene.phrase}
                  autoPlay
                />
                <Text style={styles.boardPronunciation}>{cutscene.pronunciation}</Text>
              </View>
              <Text style={styles.boardBody}>{cutscene.body}</Text>
            </View>
            <View style={styles.pointerMascot}>
              <LanguageMascot languageId={languageId} size={0.78} />
            </View>
          </View>
        ) : null}

        {variant === 'fact' ? (
          <View style={styles.factScene}>
            <View style={styles.factIcon}>
              <Text style={styles.factIconText}>?</Text>
            </View>
            <Text style={styles.factTitle}>{cutscene.title || 'Did you know?'}</Text>
            <Text style={styles.factBody}>{cutscene.body}</Text>
            <View style={styles.factMascot}>
              <LanguageMascot languageId={languageId} size={0.72} />
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={onContinue} style={({ pressed }) => [styles.continueButton, pressed && styles.continuePressed]}>
          <Text style={styles.continueText}>NEXT</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingBottom: 150,
  },
  coachScene: {
    alignItems: 'center',
  },
  coachEyebrow: {
    color: colors.accent,
    fontFamily: fonts.black,
    fontSize: 13,
    letterSpacing: 1.4,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
  },
  coachTitle: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 30,
    lineHeight: 38,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  coachBody: {
    color: colors.textMuted,
    fontFamily: fonts.black,
    fontSize: 20,
    lineHeight: 31,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  boardScene: {
    minHeight: 500,
    paddingTop: spacing.xl,
    position: 'relative',
  },
  boardString: {
    alignSelf: 'center',
    borderColor: 'rgba(244,185,66,0.28)',
    borderLeftWidth: 3,
    borderTopWidth: 3,
    height: 120,
    transform: [{ rotate: '45deg' }],
    width: 120,
  },
  boardPin: {
    alignSelf: 'center',
    backgroundColor: colors.blue,
    borderRadius: radius.pill,
    height: 18,
    marginTop: -132,
    width: 18,
    zIndex: 2,
  },
  boardCard: {
    backgroundColor: colors.text,
    borderColor: colors.blue,
    borderRadius: 30,
    borderWidth: 5,
    marginTop: 62,
    padding: spacing.lg,
  },
  boardEyebrow: {
    color: colors.blue,
    fontFamily: fonts.black,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  boardPhrase: {
    color: '#102014',
    fontFamily: fonts.black,
    fontSize: 36,
    lineHeight: 45,
    marginTop: spacing.xs,
  },
  audioRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  boardPronunciation: {
    color: colors.blue,
    fontFamily: fonts.black,
    fontSize: 17,
  },
  boardBody: {
    color: '#102014',
    fontFamily: fonts.black,
    fontSize: 22,
    lineHeight: 32,
    marginTop: spacing.lg,
  },
  pointerMascot: {
    alignItems: 'flex-end',
    marginRight: -18,
    marginTop: -12,
  },
  factScene: {
    backgroundColor: colors.text,
    borderColor: colors.blue,
    borderRadius: 34,
    borderWidth: 5,
    minHeight: 420,
    padding: spacing.xl,
    position: 'relative',
  },
  factIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.blue,
    borderRadius: radius.pill,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  factIconText: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 34,
  },
  factTitle: {
    color: colors.blue,
    fontFamily: fonts.black,
    fontSize: 32,
    lineHeight: 40,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  factBody: {
    color: '#102014',
    fontFamily: fonts.black,
    fontSize: 22,
    lineHeight: 34,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  factMascot: {
    alignItems: 'center',
    bottom: -70,
    position: 'absolute',
    right: -12,
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
    alignSelf: 'flex-end',
    backgroundColor: colors.blue,
    borderBottomColor: '#167EAD',
    borderBottomWidth: 5,
    borderRadius: radius.lg,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  continuePressed: {
    borderBottomWidth: 2,
    transform: [{ translateY: 3 }],
  },
  continueText: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 17,
    letterSpacing: 1,
  },
});
