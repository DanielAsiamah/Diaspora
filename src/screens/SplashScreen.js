import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

const PHASES = [
  {
    key: 'welcome',
    line: 'Welcome to Diaspora...',
    accent: colors.textOnDark,
    gradient: [colors.splash, '#101E33', colors.splash],
    duration: 2600,
  },
  {
    key: 'africa',
    line: 'Africa',
    accent: colors.africaGold,
    gradient: [colors.splashWarm, '#2A1808', colors.splashWarm],
    duration: 2200,
  },
  {
    key: 'caribbean',
    line: 'Caribbean',
    accent: colors.caribbeanBright,
    gradient: [colors.splashGreen, '#0D2618', colors.splashGreen],
    duration: 2200,
  },
];

export default function SplashScreen({ onFinish }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.96)).current;
  const bgProgress = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;

    async function runSequence() {
      for (let index = 0; index < PHASES.length; index += 1) {
        if (cancelled) {
          return;
        }

        setPhaseIndex(index);
        textOpacity.setValue(0);
        textScale.setValue(0.96);

        Animated.timing(bgProgress, {
          toValue: index / (PHASES.length - 1),
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();

        await animateIn();
        if (cancelled) {
          return;
        }

        await wait(PHASES[index].duration);
        if (cancelled) {
          return;
        }

        if (index < PHASES.length - 1) {
          await animateOut();
        }
      }

      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 900,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && !cancelled) {
          onFinish();
        }
      });
    }

    runSequence();

    return () => {
      cancelled = true;
    };
  }, [bgProgress, exitOpacity, onFinish, textOpacity, textScale]);

  function animateIn() {
    return new Promise((resolve) => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(textScale, {
          toValue: 1,
          speed: 12,
          bounciness: 4,
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });
  }

  function animateOut() {
    return new Promise((resolve) => {
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 700,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => resolve());
    });
  }

  const phase = PHASES[phaseIndex];
  const backgroundColor = bgProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [colors.splash, colors.splashWarm, colors.splashGreen],
  });

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
      <LinearGradient colors={phase.gradient} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <Animated.Text
          style={[
            phase.key === 'welcome' ? styles.welcomeText : styles.phaseText,
            {
              color: phase.accent,
              opacity: textOpacity,
              transform: [{ scale: textScale }],
            },
          ]}
        >
          {phase.line}
        </Animated.Text>

        {phase.key === 'caribbean' ? (
          <Animated.Text style={[styles.subline, { opacity: textOpacity }]}>
            Languages of the diaspora
          </Animated.Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  welcomeText: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  phaseText: {
    fontFamily: fonts.extraBold,
    fontSize: 52,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subline: {
    color: colors.textOnDark,
    fontFamily: fonts.medium,
    fontSize: 16,
    marginTop: 14,
    opacity: 0.82,
    textAlign: 'center',
  },
});
