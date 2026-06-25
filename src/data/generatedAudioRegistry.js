// Generated from assets/audio. Do not edit by hand.

const lessonAudioSources = {
  "patois/likkle_more.mp3": require("../../assets/audio/patois/likkle_more.mp3"),
  "patois/mawnin.mp3": require("../../assets/audio/patois/mawnin.mp3"),
  "patois/wah_deh_pon.mp3": require("../../assets/audio/patois/wah_deh_pon.mp3"),
  "patois/wah_gwaan_bredda.mp3": require("../../assets/audio/patois/wah_gwaan_bredda.mp3"),
  "patois/wah_gwaan.mp3": require("../../assets/audio/patois/wah_gwaan.mp3"),
};

export function getLessonAudioSource(languageId, audioName) {
  const language = String(languageId ?? '').trim().toLowerCase();
  const filename = String(audioName ?? '').trim().split(/[\\/]/).pop();
  if (!filename) return null;

  const exactSource = lessonAudioSources[`${language}/${filename}`];
  if (exactSource) return exactSource;

  const filenameSuffix = `/${filename}`;
  const matches = Object.entries(lessonAudioSources)
    .filter(([key]) => key.endsWith(filenameSuffix));
  return matches.length === 1 ? matches[0][1] : null;
}
