import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import PrimaryButton from './PrimaryButton';
import { colors, fonts, radius, spacing } from '../theme';

function formatHeartTimer(ms) {
  if (!ms || ms <= 0) return 'very soon';

  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

export default function OutOfHeartsModal({
  visible,
  onClose,
  onRefill,
  timeUntilNextHeartMs,
}) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>♡</Text>
          <Text style={styles.title}>Out of hearts</Text>
          <Text style={styles.body}>
            You used all 5 hearts. Refill to keep learning, or wait for them to come back.
          </Text>

          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>Next free heart</Text>
            <Text style={styles.timerValue}>{formatHeartTimer(timeUntilNextHeartMs)}</Text>
          </View>

          <PrimaryButton label="Refill hearts" onPress={onRefill} />
          <Pressable onPress={onClose} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Maybe later</Text>
          </Pressable>

          <Text style={styles.note}>Payments coming later · Free refill for now while testing</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(10, 20, 36, 0.72)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    maxWidth: 360,
    padding: spacing.lg,
    width: '100%',
  },
  emoji: {
    color: colors.heart,
    fontFamily: fonts.black,
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 24,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  body: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  timerCard: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  timerLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  timerValue: {
    color: colors.accent,
    fontFamily: fonts.black,
    fontSize: 24,
    marginTop: spacing.xs,
  },
  secondaryButton: {
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  secondaryText: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  note: {
    color: colors.textLight,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
