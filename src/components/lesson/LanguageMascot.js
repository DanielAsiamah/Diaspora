import MascotAvatar from '../mascot/MascotAvatar';

export default function LanguageMascot({ languageId = 'patois', size = 1, state, mood, style }) {
  return (
    <MascotAvatar
      languageId={languageId}
      mood={mood || state || 'idle'}
      size={size}
      style={style}
      variant="charcoal"
    />
  );
}
