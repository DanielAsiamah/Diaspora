import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../../theme';

const ACCESSORIES = {
  patois: {
    type: 'tam',
    colors: ['#E53935', '#F4B942', '#1FBE56'],
  },
  swahili: {
    type: 'scarf',
    colors: ['#111827', '#FDF8F5', '#1FBE56'],
  },
  arabic: {
    type: 'scarf',
    colors: ['#FDF8F5', '#F4B942'],
  },
  sudanese: {
    type: 'scarf',
    colors: ['#FDF8F5', '#F4B942'],
  },
  nubian: {
    type: 'scarf',
    colors: ['#FDF8F5', '#E76F51'],
  },
  french: {
    type: 'beret',
    colors: ['#202326'],
  },
  haitian: {
    type: 'scarf',
    colors: ['#1CB0F6', '#E53935'],
  },
  belizean: {
    type: 'scarf',
    colors: ['#1CB0F6', '#1FBE56'],
  },
  belize: {
    type: 'scarf',
    colors: ['#1CB0F6', '#1FBE56'],
  },
  aave: {
    type: 'cap',
    colors: ['#202326', '#35D0C5'],
  },
};

function getMood(mood, state) {
  return mood || state || 'idle';
}

function getAccessory(languageId) {
  return ACCESSORIES[languageId] || null;
}

export default function MascotAvatar({
  languageId = 'patois',
  mood = 'idle',
  state,
  size = 1,
  variant = 'charcoal',
  style,
}) {
  const currentMood = getMood(mood, state);
  const accessory = getAccessory(languageId);
  const isHappy = ['happy', 'excited', 'speaking'].includes(currentMood);
  const isSad = currentMood === 'sad';
  const isThinking = currentMood === 'thinking';
  const isSpeaking = currentMood === 'speaking';
  const fur = variant === 'black' ? '#171A1D' : '#25292D';
  const furLight = variant === 'black' ? '#24282C' : '#33383D';

  return (
    <View style={[styles.scaleBox, { transform: [{ scale: size }] }, style]}>
      <View style={styles.shadow} />
      <View style={styles.body}>
        <View style={[styles.tail, { backgroundColor: fur }]} />
        <View style={[styles.torso, { backgroundColor: fur }]}>
          <View style={[styles.belly, { backgroundColor: furLight }]} />
        </View>
        <View style={[styles.head, { backgroundColor: fur }]}>
          <View style={[styles.ear, styles.earLeft, { backgroundColor: fur }]}>
            <View style={styles.innerEar} />
          </View>
          <View style={[styles.ear, styles.earRight, { backgroundColor: fur }]}>
            <View style={styles.innerEar} />
          </View>

          {accessory?.type === 'tam' ? (
            <View style={styles.tam}>
              {accessory.colors.map((color, index) => (
                <View key={`${color}-${index}`} style={[styles.tamStripe, { backgroundColor: color }]} />
              ))}
            </View>
          ) : null}

          {accessory?.type === 'beret' ? (
            <View style={[styles.beret, { backgroundColor: accessory.colors[0] }]} />
          ) : null}

          {accessory?.type === 'cap' ? (
            <View style={[styles.cap, { backgroundColor: accessory.colors[0] }]}>
              <View style={[styles.capBrim, { backgroundColor: accessory.colors[1] }]} />
            </View>
          ) : null}

          <View style={styles.eyesRow}>
            <View style={[styles.eye, isSad && styles.eyeSad]}>
              <View style={[styles.pupil, isThinking && styles.pupilSide]} />
              <View style={styles.eyeSpark} />
            </View>
            <View style={[styles.eye, isSad && styles.eyeSad]}>
              <View style={[styles.pupil, isThinking && styles.pupilSide]} />
              <View style={styles.eyeSpark} />
            </View>
          </View>

          <View style={styles.whiskersLeft}>
            <View style={styles.whisker} />
            <View style={[styles.whisker, styles.whiskerTiltDown]} />
          </View>
          <View style={styles.whiskersRight}>
            <View style={styles.whisker} />
            <View style={[styles.whisker, styles.whiskerTiltUp]} />
          </View>

          <View style={styles.muzzle}>
            <View style={styles.nose} />
            {isSpeaking ? (
              <View style={styles.speakingMouth} />
            ) : (
              <View
                style={[
                  styles.mouth,
                  isHappy && styles.mouthHappy,
                  isSad && styles.mouthSad,
                ]}
              />
            )}
          </View>

          {isHappy ? (
            <>
              <View style={[styles.cheek, styles.cheekLeft]} />
              <View style={[styles.cheek, styles.cheekRight]} />
            </>
          ) : null}
        </View>

        <View style={styles.collar}>
          {accessory?.type === 'scarf' ? (
            <View style={styles.scarfStripes}>
              {accessory.colors.map((color, index) => (
                <View key={`${color}-${index}`} style={[styles.scarfStripe, { backgroundColor: color }]} />
              ))}
            </View>
          ) : null}
          <View style={styles.badge}>
            <View style={styles.badgeGlobe} />
          </View>
        </View>

        <View style={[styles.paw, styles.pawLeft, { backgroundColor: fur }]} />
        <View style={[styles.paw, styles.pawRight, { backgroundColor: fur }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scaleBox: {
    alignItems: 'center',
    height: 160,
    justifyContent: 'flex-end',
    width: 140,
  },
  shadow: {
    backgroundColor: 'rgba(16, 24, 32, 0.14)',
    borderRadius: radius.pill,
    bottom: 3,
    height: 18,
    position: 'absolute',
    width: 96,
  },
  body: {
    alignItems: 'center',
    height: 150,
    justifyContent: 'flex-end',
    position: 'relative',
    width: 128,
  },
  torso: {
    alignItems: 'center',
    borderRadius: 42,
    bottom: 5,
    height: 74,
    justifyContent: 'center',
    position: 'absolute',
    width: 82,
  },
  belly: {
    borderRadius: 26,
    height: 44,
    opacity: 0.6,
    width: 48,
  },
  head: {
    alignItems: 'center',
    borderRadius: 48,
    bottom: 48,
    height: 96,
    justifyContent: 'center',
    position: 'absolute',
    width: 104,
  },
  ear: {
    borderRadius: 12,
    height: 40,
    position: 'absolute',
    top: -18,
    width: 34,
  },
  earLeft: {
    left: 13,
    transform: [{ rotate: '-24deg' }],
  },
  earRight: {
    right: 13,
    transform: [{ rotate: '24deg' }],
  },
  innerEar: {
    backgroundColor: '#655B5D',
    borderRadius: 8,
    height: 22,
    marginLeft: 8,
    marginTop: 9,
    opacity: 0.68,
    width: 16,
  },
  tam: {
    borderRadius: 16,
    height: 23,
    overflow: 'hidden',
    position: 'absolute',
    top: -9,
    transform: [{ rotate: '-5deg' }],
    width: 78,
    zIndex: 4,
  },
  tamStripe: {
    flex: 1,
  },
  beret: {
    borderRadius: 28,
    height: 25,
    position: 'absolute',
    top: -11,
    transform: [{ rotate: '-10deg' }],
    width: 68,
    zIndex: 4,
  },
  cap: {
    borderRadius: 14,
    height: 22,
    position: 'absolute',
    top: -8,
    width: 70,
    zIndex: 4,
  },
  capBrim: {
    borderRadius: 12,
    bottom: -5,
    height: 9,
    position: 'absolute',
    right: 4,
    width: 34,
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 5,
  },
  eye: {
    alignItems: 'center',
    backgroundColor: '#FDF8F5',
    borderRadius: 18,
    height: 31,
    justifyContent: 'center',
    width: 25,
  },
  eyeSad: {
    transform: [{ scaleY: 0.86 }],
  },
  pupil: {
    backgroundColor: '#101214',
    borderRadius: 12,
    height: 13,
    width: 10,
  },
  pupilSide: {
    transform: [{ translateX: 3 }],
  },
  eyeSpark: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    height: 5,
    position: 'absolute',
    right: 6,
    top: 7,
    width: 5,
  },
  whiskersLeft: {
    left: 7,
    position: 'absolute',
    top: 51,
  },
  whiskersRight: {
    position: 'absolute',
    right: 7,
    top: 51,
    transform: [{ rotate: '180deg' }],
  },
  whisker: {
    backgroundColor: '#101214',
    borderRadius: radius.pill,
    height: 2,
    marginVertical: 4,
    width: 24,
  },
  whiskerTiltDown: {
    transform: [{ rotate: '9deg' }],
  },
  whiskerTiltUp: {
    transform: [{ rotate: '-9deg' }],
  },
  muzzle: {
    alignItems: 'center',
    marginTop: 3,
  },
  nose: {
    backgroundColor: '#0F1113',
    borderRadius: 7,
    height: 8,
    width: 12,
  },
  mouth: {
    borderBottomColor: '#35D0C5',
    borderBottomWidth: 4,
    borderRadius: 14,
    height: 11,
    marginTop: -1,
    width: 25,
  },
  mouthHappy: {
    borderBottomWidth: 5,
    height: 14,
    width: 31,
  },
  mouthSad: {
    borderBottomWidth: 0,
    borderTopColor: '#35D0C5',
    borderTopWidth: 4,
    marginTop: 7,
  },
  speakingMouth: {
    backgroundColor: '#35D0C5',
    borderRadius: 10,
    height: 16,
    marginTop: 4,
    width: 20,
  },
  cheek: {
    backgroundColor: '#E98686',
    borderRadius: radius.pill,
    height: 10,
    opacity: 0.62,
    position: 'absolute',
    top: 61,
    width: 10,
  },
  cheekLeft: {
    left: 20,
  },
  cheekRight: {
    right: 20,
  },
  collar: {
    alignItems: 'center',
    backgroundColor: '#35D0C5',
    borderColor: '#149B95',
    borderRadius: 13,
    borderWidth: 2,
    bottom: 56,
    height: 22,
    justifyContent: 'center',
    overflow: 'visible',
    position: 'absolute',
    width: 84,
    zIndex: 5,
  },
  scarfStripes: {
    borderRadius: 11,
    flexDirection: 'row',
    height: '100%',
    overflow: 'hidden',
    position: 'absolute',
    width: '100%',
  },
  scarfStripe: {
    flex: 1,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderColor: '#FDF8F5',
    borderRadius: radius.pill,
    borderWidth: 2,
    bottom: -13,
    height: 25,
    justifyContent: 'center',
    position: 'absolute',
    width: 25,
  },
  badgeGlobe: {
    borderColor: '#149B95',
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 13,
    width: 13,
  },
  tail: {
    borderRadius: 999,
    bottom: 27,
    height: 78,
    left: 9,
    position: 'absolute',
    transform: [{ rotate: '-24deg' }],
    width: 18,
  },
  paw: {
    borderRadius: 14,
    bottom: 0,
    height: 25,
    position: 'absolute',
    width: 28,
    zIndex: 4,
  },
  pawLeft: {
    left: 37,
  },
  pawRight: {
    right: 37,
  },
});
