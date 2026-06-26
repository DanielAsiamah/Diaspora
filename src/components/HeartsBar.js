import { StyleSheet, Text, View } from 'react-native';

export default function HeartsBar({ hearts, maxHearts }) {
  const safeMaxHearts = Number.isFinite(maxHearts) ? maxHearts : 5;
  const safeHearts = Math.max(0, Math.min(Number(hearts) || 0, safeMaxHearts));

  return (
    <View style={styles.row}>
      {Array.from({ length: safeMaxHearts }).map((_, index) => {
        const filled = index < safeHearts;

        return (
          <Text
            key={index}
            style={[
              styles.heart,
              filled ? styles.heartFilled : styles.heartEmpty,
            ]}
          >
            {filled ? '\u2764\ufe0f' : '\ud83e\ude76'}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  heart: {
    fontSize: 18,
  },
  heartFilled: {
    opacity: 1,
  },
  heartEmpty: {
    opacity: 0.55,
  },
});
