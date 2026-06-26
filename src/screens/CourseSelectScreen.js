import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AnimatedAtmosphere from '../components/AnimatedAtmosphere';
import PrimaryButton from '../components/PrimaryButton';
import MascotAvatar from '../components/mascot/MascotAvatar';
import { colors, fonts, radius, shadows, spacing } from '../theme';

const COURSES_BY_LANG = {
  english: [
    {
      id: 'patois',
      label: 'Jamaican Patois',
      subtitle: 'Greetings, respect, daily talk, food, family, and culture.',
      flag: '🇯🇲',
      category: 'Caribbean Creole',
      isNew: false,
    },
    {
      id: 'swahili',
      label: 'Swahili',
      subtitle: 'Kiswahili greetings, basics, numbers, and travel phrases.',
      flag: '🇰🇪',
      category: 'East African Bantu',
      isNew: false,
    },
    {
      id: 'igbo',
      label: 'Igbo',
      subtitle: 'Igbo greetings, family words, and everyday expressions.',
      flag: '🇳🇬',
      category: 'West African Language',
      isNew: true,
    },
    {
      id: 'belize',
      label: 'Belizean Creole',
      subtitle: 'Central American Kriol from Belize.',
      flag: '🇧🇿',
      category: 'Central American Kriol',
      isNew: true,
    },
    {
      id: 'aave',
      label: 'Black American English',
      subtitle: 'AAVE history, speech patterns, and cultural expression.',
      flag: '🇺🇸',
      category: 'Urban Dialect',
      isNew: false,
    },
  ],
  french: [
    {
      id: 'haitian',
      label: 'Créole Haïtien',
      subtitle: 'Apprenez les bases du créole haïtien.',
      flag: '🇭🇹',
      category: 'Caribbean French Creole',
      isNew: false,
    },
    {
      id: 'wolof',
      label: 'Wolof',
      subtitle: 'Pratiquez les salutations et phrases de base.',
      flag: '🇸🇳',
      category: 'West African Language',
      isNew: false,
    },
  ],
  arabic: [
    {
      id: 'sudanese',
      label: 'Sudanese Arabic',
      subtitle: 'Everyday Sudanese greetings and useful phrases.',
      flag: '🇸🇩',
      category: 'Arabic Dialect',
      isNew: false,
    },
    {
      id: 'nubian',
      label: 'Nubian',
      subtitle: 'Introductory Nubian words and Nile Valley heritage.',
      flag: '🇪🇬',
      category: 'Nile Valley Language',
      isNew: true,
    },
  ],
};

export default function CourseSelectScreen({ userLanguage, onSelectCourse, onBack }) {
  const [selected, setSelected] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;
  const courses = useMemo(() => COURSES_BY_LANG[userLanguage] || COURSES_BY_LANG.english, [userLanguage]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={styles.root}>
      <AnimatedAtmosphere colors={['#F7FCF9', '#EEF8F4']} accent={colors.primary} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar} />
          </View>
        </View>

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>Choose your path</Text>
              <Text style={styles.title}>What would you like to learn?</Text>
              <Text style={styles.subtitle}>
                Pick one course. You can add more languages later.
              </Text>
            </View>
            <MascotAvatar mood="happy" size={0.55} />
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.list}>
              <Text style={styles.sectionLabel}>
                {userLanguage === 'french'
                  ? 'Pour les francophones'
                  : userLanguage === 'arabic'
                  ? 'For Arabic speakers'
                  : 'For English speakers'}
              </Text>

              {courses.map((course) => {
                const isSelected = selected === course.id;
                return (
                  <Pressable
                    key={course.id}
                    onPress={() => setSelected(course.id)}
                    style={({ pressed }) => [
                      styles.card,
                      isSelected && styles.cardSelected,
                      pressed && styles.cardPressed,
                    ]}
                  >
                    <View style={styles.flagBox}>
                      <Text style={styles.flagEmoji}>{course.flag}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <View style={styles.labelRow}>
                        <Text style={styles.cardLabel}>{course.label}</Text>
                        {course.isNew ? (
                          <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>NEW</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.cardSubtitle}>{course.subtitle}</Text>
                      <View style={styles.tagWrapper}>
                        <Text style={styles.categoryText}>{course.category}</Text>
                      </View>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected ? <View style={styles.radioInner} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton
              label="Continue"
              disabled={!selected}
              onPress={() => selected && onSelectCourse(selected)}
            />
          </View>
        </Animated.View>
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
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  backText: {
    color: '#66756C',
    fontFamily: fonts.black,
    fontSize: 24,
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
    width: '66%',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  heroCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontFamily: fonts.black,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#102018',
    fontFamily: fonts.black,
    fontSize: 29,
    lineHeight: 35,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: '#66756C',
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
    marginTop: spacing.md,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    color: '#66756C',
    fontFamily: fonts.black,
    fontSize: 13,
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E1EEE8',
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.soft,
  },
  cardSelected: {
    backgroundColor: '#F1FFF6',
    borderColor: colors.primary,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ translateY: 2 }],
  },
  flagBox: {
    alignItems: 'center',
    backgroundColor: '#F2F6F4',
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  flagEmoji: {
    fontSize: 27,
  },
  cardInfo: {
    flex: 1,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardLabel: {
    color: '#102018',
    fontFamily: fonts.black,
    fontSize: 17,
  },
  newBadge: {
    backgroundColor: colors.africaGold,
    borderRadius: radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: '#102018',
    fontFamily: fonts.black,
    fontSize: 9,
  },
  cardSubtitle: {
    color: '#66756C',
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  tagWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(244, 185, 66, 0.16)',
    borderRadius: radius.sm,
    marginTop: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  categoryText: {
    color: '#8B6914',
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  radioCircle: {
    alignItems: 'center',
    borderColor: '#C9D7D0',
    borderRadius: 999,
    borderWidth: 2,
    height: 23,
    justifyContent: 'center',
    width: 23,
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  footer: {
    backgroundColor: 'rgba(247,252,249,0.96)',
    borderTopColor: '#E1EEE8',
    borderTopWidth: 1,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
});
