import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

export default function MascotHero() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.sun} />
      <View style={styles.cloudLeft} />
      <View style={styles.cloudRight} />

      <View style={styles.characterRow}>
        <View style={styles.palm}>
          <View style={styles.palmTrunk} />
          <View style={styles.palmLeaves}>
            <View style={[styles.leaf, styles.leafLeft]} />
            <View style={[styles.leaf, styles.leafCenter]} />
            <View style={[styles.leaf, styles.leafRight]} />
          </View>
        </View>

        <View style={styles.character}>
          <View style={styles.headband} />
          <View style={styles.face}>
            <View style={styles.eyesRow}>
              <View style={styles.eye}>
                <View style={styles.pupil} />
              </View>
              <View style={styles.eye}>
                <View style={styles.pupil} />
              </View>
            </View>
            <View style={styles.smile} />
            <View style={styles.cheekLeft} />
            <View style={styles.cheekRight} />
          </View>
          <View style={styles.body}>
            <View style={styles.shirtStripe} />
          </View>
        </View>
      </View>

      <View style={styles.ground} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    height: 240,
    justifyContent: 'flex-end',
    width: '100%',
  },
  sun: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: 56,
    position: 'absolute',
    right: 24,
    top: 8,
    width: 56,
  },
  cloudLeft: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 999,
    height: 28,
    left: 18,
    position: 'absolute',
    top: 28,
    width: 72,
  },
  cloudRight: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 999,
    height: 22,
    position: 'absolute',
    right: 96,
    top: 52,
    width: 56,
  },
  characterRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  palm: {
    alignItems: 'center',
    marginBottom: 4,
    width: 54,
  },
  palmTrunk: {
    backgroundColor: '#8B5E3C',
    borderRadius: 8,
    height: 42,
    width: 12,
  },
  palmLeaves: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: -8,
    width: 54,
  },
  leaf: {
    backgroundColor: colors.grassDark,
    borderRadius: 999,
    height: 28,
    position: 'absolute',
    width: 12,
  },
  leafLeft: {
    left: 8,
    transform: [{ rotate: '-28deg' }],
  },
  leafCenter: {
    top: -10,
  },
  leafRight: {
    right: 8,
    transform: [{ rotate: '28deg' }],
  },
  character: {
    alignItems: 'center',
  },
  headband: {
    backgroundColor: colors.grassDark,
    borderRadius: 999,
    height: 18,
    marginBottom: -10,
    width: 92,
    zIndex: 2,
  },
  face: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderColor: '#E6A600',
    borderRadius: 999,
    borderWidth: 3,
    height: 92,
    justifyContent: 'center',
    width: 92,
    zIndex: 1,
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 4,
  },
  eye: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  pupil: {
    backgroundColor: colors.textDark,
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  smile: {
    backgroundColor: 'transparent',
    borderBottomColor: colors.textDark,
    borderBottomWidth: 3,
    borderRadius: 999,
    height: 10,
    marginTop: 8,
    width: 24,
  },
  cheekLeft: {
    backgroundColor: 'rgba(255,107,107,0.35)',
    borderRadius: 999,
    height: 12,
    left: 12,
    position: 'absolute',
    top: 52,
    width: 12,
  },
  cheekRight: {
    backgroundColor: 'rgba(255,107,107,0.35)',
    borderRadius: 999,
    height: 12,
    position: 'absolute',
    right: 12,
    top: 52,
    width: 12,
  },
  body: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    borderRadius: 18,
    borderWidth: 3,
    height: 56,
    marginTop: -8,
    overflow: 'hidden',
    width: 72,
  },
  shirtStripe: {
    backgroundColor: colors.accent,
    height: 10,
    marginTop: 18,
    width: '100%',
  },
  ground: {
    backgroundColor: colors.grass,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    height: 36,
    width: '110%',
  },
});
