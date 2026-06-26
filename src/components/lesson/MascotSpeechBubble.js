import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../../theme';

export default function MascotSpeechBubble({ eyebrow, children }) {
  return (
    <View style={styles.bubble}>
      <View style={styles.tail} />
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.copy}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1EEE8',
    borderRadius: radius.xl,
    borderWidth: 2,
    flex: 1,
    padding: spacing.md,
    position: 'relative',
  },
  tail: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E1EEE8',
    borderBottomWidth: 2,
    borderLeftColor: '#E1EEE8',
    borderLeftWidth: 2,
    height: 18,
    left: -10,
    position: 'absolute',
    top: 34,
    transform: [{ rotate: '45deg' }],
    width: 18,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: fonts.black,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  copy: {
    color: '#102018',
    fontFamily: fonts.black,
    fontSize: 19,
    lineHeight: 27,
  },
});
