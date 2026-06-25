import { useAudioPlayer } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../../theme';

export default function LessonAudioButton({
  source,
  label = 'Play audio',
  compact = false,
  fallbackText,
  onFallbackPress,
  autoPlay = false,
}) {
  const player = useAudioPlayer(source);
  const [showFallback, setShowFallback] = useState(false);

  if (!source) return null;

  function play() {
    try {
      const seekResult = player.seekTo(0);
      if (seekResult?.then) {
        seekResult.then(() => player.play()).catch(() => {});
        return;
      }
      player.play();
    } catch {
      // Audio should never block the lesson if a device cannot play the file.
    }
  }

  useEffect(() => {
    if (autoPlay) {
      play();
    }
  }, [autoPlay, source]);

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        hitSlop={10}
        onPress={play}
        style={({ pressed }) => [
          styles.audioButton,
          compact && styles.audioButtonCompact,
          pressed && styles.audioButtonPressed,
        ]}
      >
        <Text style={[styles.soundIcon, compact && styles.soundIconCompact]}>🔊</Text>
      </Pressable>

      {fallbackText ? (
        <Pressable
          accessibilityLabel="Show text if you cannot listen right now"
          accessibilityRole="button"
          onPress={() => {
            if (onFallbackPress) {
              onFallbackPress(fallbackText);
              return;
            }
            setShowFallback((current) => !current);
          }}
          style={styles.fallbackToggle}
        >
          <Text style={styles.fallbackToggleText}>⌄</Text>
        </Pressable>
      ) : null}

      {!onFallbackPress && showFallback && fallbackText ? (
        <View style={styles.fallbackCard}>
          <Text style={styles.fallbackCaption}>Can't listen right now?</Text>
          <Text style={styles.fallbackText}>{fallbackText}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  audioButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(28, 176, 246, 0.14)',
    borderColor: 'rgba(28, 176, 246, 0.3)',
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  audioButtonCompact: {
    minHeight: 36,
    paddingHorizontal: 10,
  },
  audioButtonPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
  soundIcon: {
    fontSize: 22,
  },
  soundIconCompact: {
    fontSize: 18,
  },
  fallbackToggle: {
    alignItems: 'center',
    marginTop: -2,
    minHeight: 18,
    justifyContent: 'center',
    width: 36,
  },
  fallbackToggleText: {
    color: colors.blue,
    fontFamily: fonts.black,
    fontSize: 18,
    lineHeight: 18,
  },
  fallbackCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    left: 0,
    padding: spacing.sm,
    position: 'absolute',
    top: 62,
    width: 170,
    zIndex: 20,
  },
  fallbackCaption: {
    color: colors.textMuted,
    fontFamily: fonts.black,
    fontSize: 10,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  fallbackText: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 14,
    lineHeight: 19,
  },
});
