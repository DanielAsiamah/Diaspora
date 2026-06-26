import { useAudioPlayer } from 'expo-audio';
import { Pressable } from 'react-native';

export default function AudioPressable({
  audioSource,
  children,
  disabled,
  onAudioPlay,
  onPress,
  style,
  ...pressableProps
}) {
  const player = useAudioPlayer(audioSource);

  function playAudio() {
    if (!audioSource) return;
    onAudioPlay?.();

    try {
      const seekResult = player.seekTo(0);
      if (seekResult?.then) {
        seekResult.then(() => player.play()).catch(() => {});
        return;
      }
      player.play();
    } catch {
      // Audio should never block a tap interaction.
    }
  }

  return (
    <Pressable
      {...pressableProps}
      disabled={disabled}
      onPress={(event) => {
        playAudio();
        onPress?.(event);
      }}
      style={style}
    >
      {children}
    </Pressable>
  );
}
