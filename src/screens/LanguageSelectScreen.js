import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AnimatedAtmosphere from '../components/AnimatedAtmosphere';
import MascotHero from '../components/MascotHero';
import { colors, fonts, radius, shadows, spacing } from '../theme';

const NATIVE_LANGUAGES = [
  {
    id: 'english',
    label: 'English',
    subtitle: 'Learn from English',
    flag: '🇺🇸',
    accentColor: colors.blue,
  },
  {
    id: 'french',
    label: 'Français',
    subtitle: 'Apprendre depuis le français',
    flag: '🇫🇷',
    accentColor: colors.coral,
  },
  {
    id: 'arabic',
    label: 'العربية',
    subtitle: 'تعلم من اللغة العربية',
    flag: '🇸🇦',
    accentColor: colors.africaGold,
  },
];

export default function LanguageSelectScreen({ onSelectLanguage, onBack }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

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
      <AnimatedAtmosphere colors={['#F7FCF9', '#EEF8F4']} accent={colors.blue} />

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
          <MascotHero compact mood="thinking" />
          <Text style={styles.eyebrow}>Personalize your lessons</Text>
          <Text style={styles.title}>What language do you speak?</Text>
          <Text style={styles.subtitle}>
            Choose the language you want explanations and support in.
          </Text>

          <View style={styles.list}>
            {NATIVE_LANGUAGES.map((lang) => (
              <Pressable
                key={lang.id}
                onPress={() => onSelectLanguage(lang.id)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                  { borderLeftColor: lang.accentColor },
                ]}
              >
                <View style={[styles.flagBadge, { backgroundColor: lang.accentColor + '18' }]}>
                  <Text style={styles.flagEmoji}>{lang.flag}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>{lang.label}</Text>
                  <Text style={styles.cardSubtitle}>{lang.subtitle}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </Pressable>
            ))}
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
    width: '33%',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontFamily: fonts.black,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
  },
  title: {
    color: '#102018',
    fontFamily: fonts.black,
    fontSize: 30,
    lineHeight: 36,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: '#66756C',
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E1EEE8',
    borderLeftWidth: 5,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.soft,
  },
  cardPressed: {
    opacity: 0.78,
    transform: [{ translateY: 2 }],
  },
  flagBadge: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  flagEmoji: {
    fontSize: 28,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    color: '#102018',
    fontFamily: fonts.black,
    fontSize: 18,
  },
  cardSubtitle: {
    color: '#66756C',
    fontFamily: fonts.bold,
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    color: '#9AA9A1',
    fontFamily: fonts.black,
    fontSize: 20,
  },
});
