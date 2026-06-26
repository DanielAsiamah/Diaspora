import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import LanguageMascot from '../components/lesson/LanguageMascot';
import { colors, fonts, radius, shadows, spacing } from '../theme';

const COURSE_LABELS = {
  patois: 'Jamaican Patois',
  swahili: 'Swahili',
  igbo: 'Igbo',
  wolof: 'Wolof',
  haitian: 'Haitian Creole',
  belize: 'Belizean Creole',
  belizean: 'Belizean Creole',
  aave: 'Black American English',
  sudanese: 'Sudanese Arabic',
  nubian: 'Nubian',
};

export default function StartUnitScreen({
  courseId,
  recommendedStartUnit = 1,
  onBack,
  onComplete,
}) {
  const [selectedUnit, setSelectedUnit] = useState(recommendedStartUnit);
  const courseLabel = COURSE_LABELS[courseId] || 'your language';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#F7FCF9', '#EEF8F4']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.mascotWrap}>
            <LanguageMascot languageId={courseId} size={1.05} />
          </View>
          <Text style={styles.eyebrow}>Your starting point</Text>
          <Text style={styles.title}>Where should your {courseLabel} journey begin?</Text>
          <Text style={styles.subtitle}>
            You can start gentle with Unit 1, or begin at Unit 2 if the tutor thinks you are ready.
          </Text>

          <View style={styles.options}>
            <Pressable
              onPress={() => setSelectedUnit(1)}
              style={[
                styles.optionCard,
                selectedUnit === 1 && styles.optionCardSelected,
              ]}
            >
              <Text style={styles.optionKicker}>Recommended for most learners</Text>
              <Text style={styles.optionTitle}>Start from Unit 1</Text>
              <Text style={styles.optionBody}>
                Learn the basics, hear the tutor, and build confidence before harder sentences.
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedUnit(2)}
              style={[
                styles.optionCard,
                selectedUnit === 2 && styles.optionCardSelected,
              ]}
            >
              <Text style={styles.optionKicker}>
                {recommendedStartUnit === 2 ? 'Tutor recommendation' : 'Optional jump ahead'}
              </Text>
              <Text style={styles.optionTitle}>Start from Unit 2</Text>
              <Text style={styles.optionBody}>
                Move faster with more phrases and slightly less hand-holding.
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label={`START UNIT ${selectedUnit}`}
            onPress={() => onComplete({ selectedStartUnit: selectedUnit })}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#F7FCF9',
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
    color: '#66756C',
    fontFamily: fonts.black,
    fontSize: 14,
  },
  progressContainer: {
    backgroundColor: '#DCEAE4',
    borderRadius: radius.pill,
    flex: 1,
    height: 10,
    marginLeft: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: colors.primary,
    height: '100%',
    width: '88%',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  mascotWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: fonts.black,
    fontSize: 13,
    letterSpacing: 1.3,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
  },
  title: {
    color: '#102018',
    fontFamily: fonts.black,
    fontSize: 30,
    lineHeight: 38,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: '#66756C',
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  options: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#DDEAE4',
    borderBottomWidth: 4,
    borderColor: '#E1EEE8',
    borderRadius: radius.xl,
    borderWidth: 2,
    padding: spacing.lg,
    ...shadows.soft,
  },
  optionCardSelected: {
    backgroundColor: '#F1FFF6',
    borderBottomColor: colors.primaryDark,
    borderColor: colors.primary,
  },
  optionKicker: {
    color: colors.accent,
    fontFamily: fonts.black,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  optionTitle: {
    color: '#102018',
    fontFamily: fonts.black,
    fontSize: 23,
    marginTop: spacing.sm,
  },
  optionBody: {
    color: '#66756C',
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  footer: {
    backgroundColor: 'rgba(247,252,249,0.96)',
    borderTopColor: '#E1EEE8',
    borderTopWidth: 1,
    padding: spacing.lg,
  },
});
