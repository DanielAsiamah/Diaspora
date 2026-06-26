import { useEffect, useRef, useState } from 'react';
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
import MascotHero from '../components/MascotHero';
import PrimaryButton from '../components/PrimaryButton';
import SpeechBubble from '../components/SpeechBubble';
import { colors, fonts, radius, shadows, spacing } from '../theme';

const GREETINGS = ['Wah gwaan!', 'Hujambo!', 'Sak pase!', 'Nanga def!'];

const LESSON_PROMISES = [
  { label: 'Listen', detail: 'Hear real phrases first.' },
  { label: 'Practice', detail: 'Build answers step by step.' },
  { label: 'Culture', detail: 'Learn the meaning behind words.' },
];

export default function WelcomeScreen({ onGetStarted, onSignIn }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;
  const [greetingIndex, setGreetingIndex] = useState(0);
  const bubbleFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 580,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();

    const interval = setInterval(() => {
      Animated.timing(bubbleFade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
        Animated.timing(bubbleFade, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }).start();
      });
    }, 2600);

    return () => clearInterval(interval);
  }, [bubbleFade, fadeAnim, slideAnim]);

  return (
    <View style={styles.root}>
      <AnimatedAtmosphere
        colors={['#F7FCF9', '#EEF8F4']}
        accent={colors.primary}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>D</Text>
              </View>
              <Text style={styles.brandName}>Diaspora</Text>
            </View>

            <MascotHero />

            <View style={styles.heroCopy}>
              <Animated.View style={{ opacity: bubbleFade }}>
                <SpeechBubble text={GREETINGS[greetingIndex]} tone="light" />
              </Animated.View>
              <Text style={styles.title}>Learn the languages{'\n'}of the diaspora</Text>
              <Text style={styles.subtitle}>
                Bite-sized lessons in creoles, mother tongues, and cultural speech.
              </Text>
            </View>

            <View style={styles.promiseGrid}>
              {LESSON_PROMISES.map((item) => (
                <View key={item.label} style={styles.promiseCard}>
                  <Text style={styles.promiseLabel}>{item.label}</Text>
                  <Text style={styles.promiseDetail}>{item.detail}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="GET STARTED" onPress={onGetStarted} />
          <Pressable onPress={onSignIn} style={styles.signInButton}>
            <Text style={styles.signInText}>I already have an account</Text>
          </Pressable>
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
  content: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },
  logoBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  logoText: {
    color: '#FFFFFF',
    fontFamily: fonts.black,
    fontSize: 18,
  },
  brandName: {
    color: '#102018',
    fontFamily: fonts.black,
    fontSize: 23,
  },
  heroCopy: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  title: {
    color: '#102018',
    fontFamily: fonts.black,
    fontSize: 31,
    lineHeight: 38,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: '#66756C',
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.sm,
    maxWidth: 320,
    textAlign: 'center',
  },
  promiseGrid: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  promiseCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1EEE8',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...shadows.soft,
  },
  promiseLabel: {
    color: colors.primaryDark,
    fontFamily: fonts.black,
    fontSize: 16,
  },
  promiseDetail: {
    color: '#66756C',
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  footer: {
    backgroundColor: 'rgba(247,252,249,0.96)',
    borderTopColor: '#E1EEE8',
    borderTopWidth: 1,
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  signInButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  signInText: {
    color: colors.blue,
    fontFamily: fonts.extraBold,
    fontSize: 15,
  },
});
