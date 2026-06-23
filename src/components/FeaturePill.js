import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '../theme';

export default function FeaturePill({ emoji, label, tint = colors.primaryLight }) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.iconCircle, { backgroundColor: tint }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  emoji: {
    fontSize: 26,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 12,
    textAlign: 'center',
  },
});
