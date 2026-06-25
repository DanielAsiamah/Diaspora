import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../theme';

const BASE_LANGUAGES = {
  english: {
    id: 'english',
    label: 'English',
    question: 'How well can you speak English?',
  },
  french: {
    id: 'french',
    label: 'French',
    question: 'How well can you speak French?',
  },
  arabic: {
    id: 'arabic',
    label: 'Arabic',
    question: 'How well can you speak Arabic?',
  },
};

const LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    detail: 'I understand simple words and need slow explanations.',
    score: 1,
  },
  {
    id: 'comfortable',
    label: 'Comfortable',
    detail: 'I can follow everyday explanations and short examples.',
    score: 2,
  },
  {
    id: 'strong',
    label: 'Strong',
    detail: 'I can understand harder grammar, culture notes, and longer tasks.',
    score: 3,
  },
];

export default function ProficiencyCheckScreen({ userLanguage, onBack, onComplete }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const selectedLanguage = BASE_LANGUAGES[userLanguage] || BASE_LANGUAGES.english;

  const selectedBaseLevel = LEVELS.find((level) => level.id === selectedLevel) || LEVELS[0];
  const recommendedStartUnit = selectedBaseLevel.score >= 3 ? 2 : 1;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.skyTop, colors.skyBottom]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>Personalize your lessons</Text>
          <Text style={styles.title}>How should your tutor explain things?</Text>
          <Text style={styles.subtitle}>
            This helps Diaspora choose how much support, translation and challenge to show at the start.
          </Text>

          <View style={styles.stack}>
            <View style={styles.questionCard}>
              <Text style={styles.question}>{selectedLanguage.question}</Text>
              <Text style={styles.questionHint}>
                We only ask about your chosen app language for now. You can add more later in settings.
              </Text>
              <View style={styles.levelList}>
                {LEVELS.map((level) => {
                  const isSelected = selectedLevel === level.id;
                  return (
                    <Pressable
                      key={level.id}
                      onPress={() => setSelectedLevel(level.id)}
                      style={[
                        styles.levelCard,
                        isSelected && styles.levelCardSelected,
                      ]}
                    >
                      <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isSelected ? <View style={styles.radioInner} /> : null}
                      </View>
                      <View style={styles.levelCopy}>
                        <Text style={styles.levelLabel}>{level.label}</Text>
                        <Text style={styles.levelDetail}>{level.detail}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={recommendedStartUnit === 2 ? 'CONTINUE - UNIT 2 RECOMMENDED' : 'CONTINUE - UNIT 1 RECOMMENDED'}
            disabled={!selectedLevel}
            onPress={() => onComplete({
              baseLanguage: userLanguage,
              baseLanguageLevels: { [userLanguage]: selectedLevel },
              recommendedStartUnit,
            })}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.skyBottom,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
    paddingRight: spacing.sm,
  },
  backText: {
    color: colors.textMuted,
    fontFamily: fonts.black,
    fontSize: 14,
  },
  progressContainer: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    flex: 1,
    height: 10,
    marginLeft: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: colors.primary,
    height: '100%',
    width: '50%',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: fonts.black,
    fontSize: 13,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 30,
    lineHeight: 38,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  stack: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 2,
    padding: spacing.md,
  },
  question: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 18,
    lineHeight: 25,
  },
  questionHint: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  levelList: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  levelCard: {
    alignItems: 'center',
    backgroundColor: colors.splashWarm,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  levelCardSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 12,
    width: 12,
  },
  levelCopy: {
    flex: 1,
  },
  levelLabel: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 16,
  },
  levelDetail: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  footer: {
    backgroundColor: colors.skyBottom,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: spacing.lg,
    position: 'absolute',
    right: 0,
  },
});
