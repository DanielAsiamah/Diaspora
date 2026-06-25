import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../../theme';

const mascotLooks = {
  patois: {
    hat: ['#0B8A3C', '#F4B942', '#E64A35'],
    hair: true,
    shirt: '#1FBE56',
    stripe: '#F4B942',
  },
  swahili: {
    hat: ['#F4B942', '#FDF8F5', '#0B8A3C'],
    shirt: '#0B8A3C',
    stripe: '#FDF8F5',
  },
  igbo: {
    hat: ['#E64A35', '#F4B942', '#0B8A3C'],
    shirt: '#E76F51',
    stripe: '#F4B942',
  },
  wolof: {
    hat: ['#0B8A3C', '#F4B942', '#E64A35'],
    shirt: '#F4B942',
    stripe: '#0B8A3C',
  },
  haitian: {
    hat: ['#1CB0F6', '#E64A35', '#FDF8F5'],
    shirt: '#1CB0F6',
    stripe: '#E64A35',
  },
  belizean: {
    hat: ['#1CB0F6', '#F4B942', '#0B8A3C'],
    shirt: '#1FBE56',
    stripe: '#1CB0F6',
  },
  aave: {
    hat: ['#2E221B', '#F4B942', '#2E221B'],
    shirt: '#1CB0F6',
    stripe: '#F4B942',
  },
  sudanese: {
    headWrap: '#FDF8F5',
    shirt: '#0B8A3C',
    stripe: '#F4B942',
  },
  nubian: {
    headWrap: '#FDF8F5',
    shirt: '#E76F51',
    stripe: '#F4B942',
  },
  arabic: {
    headWrap: '#FDF8F5',
    shirt: '#0B8A3C',
    stripe: '#F4B942',
  },
  french: {
    beret: '#2E221B',
    scarf: '#E64A35',
    shirt: '#1CB0F6',
    stripe: '#FDF8F5',
  },
};

function getLook(languageId) {
  return mascotLooks[languageId] || {
    hat: ['#0B8A3C', '#F4B942', '#0B8A3C'],
    shirt: '#1FBE56',
    stripe: '#F4B942',
  };
}

export default function LanguageMascot({ languageId = 'patois', size = 1 }) {
  const look = getLook(languageId);
  const scaleStyle = { transform: [{ scale: size }] };

  return (
    <View style={[styles.wrapper, scaleStyle]}>
      {look.headWrap ? (
        <View style={[styles.headWrap, { backgroundColor: look.headWrap }]} />
      ) : null}
      {look.beret ? (
        <View style={[styles.beret, { backgroundColor: look.beret }]} />
      ) : null}
      {look.hat ? (
        <View style={styles.hat}>
          {look.hat.map((color, index) => (
            <View key={`${color}-${index}`} style={[styles.hatStripe, { backgroundColor: color }]} />
          ))}
        </View>
      ) : null}

      <View style={styles.face}>
        {look.hair ? (
          <>
            <View style={[styles.lock, styles.lockLeft]} />
            <View style={[styles.lock, styles.lockRight]} />
          </>
        ) : null}
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

      {look.scarf ? <View style={[styles.scarf, { backgroundColor: look.scarf }]} /> : null}
      <View style={[styles.body, { backgroundColor: look.shirt }]}>
        <View style={[styles.shirtStripe, { backgroundColor: look.stripe }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    height: 148,
    justifyContent: 'flex-end',
    width: 116,
  },
  face: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderColor: colors.accentDark,
    borderRadius: 42,
    borderWidth: 3,
    height: 82,
    justifyContent: 'center',
    width: 82,
    zIndex: 2,
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 3,
  },
  eye: {
    alignItems: 'center',
    backgroundColor: colors.text,
    borderRadius: radius.pill,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  pupil: {
    backgroundColor: '#140F0C',
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  smile: {
    borderBottomColor: colors.text,
    borderBottomWidth: 3,
    borderRadius: 12,
    height: 12,
    marginTop: 8,
    width: 28,
  },
  cheekLeft: {
    backgroundColor: 'rgba(231,111,81,0.55)',
    borderRadius: radius.pill,
    height: 12,
    left: 12,
    position: 'absolute',
    top: 48,
    width: 12,
  },
  cheekRight: {
    backgroundColor: 'rgba(231,111,81,0.55)',
    borderRadius: radius.pill,
    height: 12,
    position: 'absolute',
    right: 12,
    top: 48,
    width: 12,
  },
  body: {
    alignItems: 'center',
    borderColor: colors.primaryDark,
    borderRadius: 22,
    borderWidth: 3,
    height: 52,
    justifyContent: 'center',
    marginTop: -7,
    overflow: 'hidden',
    width: 68,
  },
  shirtStripe: {
    height: 12,
    width: '100%',
  },
  hat: {
    borderRadius: 28,
    height: 26,
    overflow: 'hidden',
    transform: [{ rotate: '-4deg' }],
    width: 90,
    zIndex: 3,
    marginBottom: -10,
  },
  hatStripe: {
    flex: 1,
  },
  headWrap: {
    borderColor: '#DDD2C8',
    borderRadius: 30,
    borderWidth: 2,
    height: 36,
    marginBottom: -14,
    width: 92,
    zIndex: 3,
  },
  beret: {
    borderRadius: 30,
    height: 28,
    marginBottom: -10,
    transform: [{ rotate: '-10deg' }],
    width: 74,
    zIndex: 3,
  },
  scarf: {
    borderRadius: radius.pill,
    height: 12,
    marginBottom: -2,
    marginTop: -4,
    width: 58,
    zIndex: 3,
  },
  lock: {
    backgroundColor: '#2E221B',
    borderRadius: radius.pill,
    height: 32,
    position: 'absolute',
    top: 14,
    width: 10,
  },
  lockLeft: {
    left: 4,
    transform: [{ rotate: '18deg' }],
  },
  lockRight: {
    right: 4,
    transform: [{ rotate: '-18deg' }],
  },
});
