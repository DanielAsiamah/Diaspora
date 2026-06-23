import { StyleSheet, Text, View } from 'react-native';

export default function HeartsBar({ hearts, maxHearts }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxHearts }).map((_, index) => {
        const filled = index < hearts;

        return (
          <Text key={index} style={[styles.heart, !filled && styles.heartEmpty]}>
            {filled ? '❤️' : '🩶'}
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
  heartEmpty: {
    opacity: 0.45,
  },
});
