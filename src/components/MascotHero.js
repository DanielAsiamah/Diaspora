import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, shadows } from '../theme';
import MascotAvatar from './mascot/MascotAvatar';

export default function MascotHero({ languageId = 'patois', mood = 'happy', compact = false }) {
  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <View style={styles.heroCard}>
        <View style={styles.orbitOne} />
        <View style={styles.orbitTwo} />
        <MascotAvatar languageId={languageId} mood={mood} size={compact ? 0.72 : 1.05} />
        {!compact ? (
          <View style={styles.captionPill}>
            <Text style={styles.caption}>Your tutor is ready</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  wrapperCompact: {
    marginVertical: 0,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E9F3EF',
    borderRadius: 42,
    borderWidth: 1,
    minHeight: 218,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingTop: 22,
    width: '100%',
    ...shadows.card,
  },
  orbitOne: {
    backgroundColor: 'rgba(53, 208, 197, 0.12)',
    borderRadius: radius.pill,
    height: 190,
    position: 'absolute',
    right: -72,
    top: -58,
    width: 190,
  },
  orbitTwo: {
    backgroundColor: 'rgba(244, 185, 66, 0.14)',
    borderRadius: radius.pill,
    bottom: -65,
    height: 160,
    left: -54,
    position: 'absolute',
    width: 160,
  },
  captionPill: {
    backgroundColor: colors.primaryLight,
    borderColor: 'rgba(31, 190, 86, 0.24)',
    borderRadius: radius.pill,
    borderWidth: 1,
    marginBottom: 18,
    marginTop: -2,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  caption: {
    color: colors.primaryDark,
    fontFamily: fonts.black,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
