import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '../theme';

export default function SpeechBubble({ text, tone = 'dark' }) {
  const light = tone === 'light';
  return (
    <View style={styles.wrapper}>
      <View style={[styles.bubble, light && styles.bubbleLight]}>
        <Text style={[styles.text, light && styles.textLight]}>{text}</Text>
      </View>
      <View style={[styles.tail, light && styles.tailLight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    maxWidth: 220,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tail: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    height: 14,
    marginTop: -8,
    transform: [{ rotate: '45deg' }],
    width: 14,
  },
  text: {
    color: colors.textDark,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    textAlign: 'center',
  },
  bubbleLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1EEE8',
  },
  tailLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1EEE8',
  },
  textLight: {
    color: '#102018',
  },
});
