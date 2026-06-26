import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../../theme';
import LessonAudioButton from './LessonAudioButton';

export default function VocabularyCard({ item, audioSource, imageSource, index, onAudioPlay }) {
  return (
    <View style={styles.card}>
      {imageSource ? (
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>
      )}
      <View style={styles.copy}>
        <Text style={styles.word}>{item.phrase}</Text>
        <Text style={styles.meaning}>{item.meaning}</Text>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
      </View>
      <LessonAudioButton
        compact
        label={`Play pronunciation for ${item.phrase}`}
        source={audioSource}
        fallbackText={item.phrase}
        onAudioPlay={onAudioPlay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#DDEAE4',
    borderBottomWidth: 4,
    borderColor: '#E1EEE8',
    borderRadius: radius.xl,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  badgeText: {
    color: colors.primaryDark,
    fontFamily: fonts.black,
    fontSize: 16,
  },
  image: {
    backgroundColor: '#F4FAF7',
    borderColor: '#E1EEE8',
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 58,
    width: 58,
  },
  copy: {
    flex: 1,
  },
  word: {
    color: '#102018',
    fontFamily: fonts.black,
    fontSize: 22,
    lineHeight: 29,
  },
  meaning: {
    color: colors.blue,
    fontFamily: fonts.black,
    fontSize: 16,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  note: {
    color: '#66756C',
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
});
