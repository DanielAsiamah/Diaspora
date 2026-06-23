import { LinearGradient } from 'expo-linear-gradient';
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

import MascotHero from '../components/MascotHero';
import PrimaryButton from '../components/PrimaryButton';
import SpeechBubble from '../components/SpeechBubble';
import { colors, fonts, radius, spacing } from '../theme';

const GREETINGS = [
  'Wah gwaan! 👋',
  'Hujambo! 👋',
  'Sak pase! 👋',
  'What\'s good! 👋',
  'Weh di go ahn! 👋',
  'Nangaadef! 👋',
];

const REGIONS = [
  {
    id: 'africa',
    title: 'Africa 🌍',
    caption: 'Motherland tongues: Swahili, Igbo, Wolof...',
    color: colors.africaGold,
  },
  {
    id: 'caribbean',
    title: 'Caribbean 🏝️',
    caption: 'Vibrant creoles: Jamaican Patois, Haitian Creole...',
    color: colors.caribbeanGreen,
  },
  {
    id: 'central-america',
    title: 'Central America 🌎',
    caption: 'Kriol roots: Belizean Creole & coastal dialects...',
    color: colors.coral,
  },
  {
    id: 'america',
    title: 'America 🇺🇸',
    caption: 'Black American English & cultural vernaculars...',
    color: colors.blue,
  },
];

export default function WelcomeScreen({ onGetStarted, onSignIn }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  
  // Greetings cycling state
  const [greetingIndex, setGreetingIndex] = useState(0);
  const bubbleFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial entrance anim
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Greetings transition timer
    const interval = setInterval(() => {
      Animated.timing(bubbleFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
        Animated.timing(bubbleFade, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.skyTop, colors.skyBottom]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Logo Row */}
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoEmoji}>🌎</Text>
              </View>
              <Text style={styles.brandName}>Diaspora</Text>
            </View>

            {/* Mascot */}
            <MascotHero />

            {/* Dynamic Welcome & Intro */}
            <View style={styles.heroCopy}>
              <Animated.View style={{ opacity: bubbleFade }}>
                <SpeechBubble text={GREETINGS[greetingIndex]} />
              </Animated.View>
              <Text style={styles.title}>Learn the languages{'\n'}of the diaspora</Text>
              <Text style={styles.subtitle}>
                Fun, bite-sized interactive lessons covering mother tongues, regional creoles, and urban dialects.
              </Text>
            </View>

            {/* Support Regions Grid */}
            <View style={styles.regionsSection}>
              <Text style={styles.sectionHeader}>SUPPORTED DIALECTS & LANGUAGES</Text>
              <View style={styles.regionsGrid}>
                {REGIONS.map((region) => (
                  <View
                    key={region.id}
                    style={[styles.regionCard, { borderLeftColor: region.color }]}
                  >
                    <Text style={styles.regionTitle}>{region.title}</Text>
                    <Text style={styles.regionCaption}>{region.caption}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <PrimaryButton label="Get Started" onPress={onGetStarted} />
          <Pressable onPress={onSignIn} style={styles.signInButton}>
            <Text style={styles.signInText}>I already have an account</Text>
          </Pressable>
          <Text style={styles.footerNote}>Free to start · No Apple fee yet</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.skyBottom,
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
    marginBottom: spacing.xs,
  },
  logoBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 2,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  logoEmoji: {
    fontSize: 20,
  },
  brandName: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 22,
  },
  heroCopy: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  title: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 28,
    lineHeight: 34,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  regionsSection: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    color: colors.textLight,
    fontFamily: fonts.black,
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  regionsGrid: {
    gap: spacing.sm,
  },
  regionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderLeftWidth: 5,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  regionTitle: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 16,
  },
  regionCaption: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  footer: {
    backgroundColor: colors.skyBottom,
    borderTopColor: colors.border,
    borderTopWidth: 1.5,
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
  footerNote: {
    color: colors.textLight,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    textAlign: 'center',
  },
});
