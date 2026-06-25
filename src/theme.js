export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 30 * 60 * 1000;

export const colors = {
  splash: '#140F0C', // Cozy dark espresso
  splashWarm: '#1E1612', // Cocoa brown
  splashGreen: '#0B1E14', // Forest deep green
  
  // Theme highlights
  africaGold: '#F4B942', // Radiant gold
  africaWarm: '#E76F51', // Terracotta clay orange
  caribbeanGreen: '#1FBE56', // Emerald green
  caribbeanBright: '#2ECF6C', // Bright lime/green
  
  // Interface Surfaces (Cozy Theme)
  skyTop: '#1E1612', // Cocoa night sky top gradient
  skyBottom: '#140F0C', // Dark espresso night sky bottom gradient
  grass: '#1FBE56',
  grassDark: '#0B8A3C',
  
  primary: '#1FBE56', // Emerald green
  primaryDark: '#0B8A3C',
  primaryLight: 'rgba(31, 190, 86, 0.15)', // transparent green tint
  accent: '#F4B942', // Gold
  accentDark: '#CFA034',
  coral: '#E76F51', // Terracotta
  purple: '#CE82FF',
  blue: '#1CB0F6',
  
  // Dark Cozy Typography & Elements
  surface: '#1E1612', // Rich chocolate cocoa surface
  surfaceMuted: '#291F19', // Slightly lighter cocoa surface
  text: '#FDF8F5', // Soft cozy cream text
  textDark: '#FDF8F5', // Soft cozy cream text for dark backgrounds
  textOnDark: '#FDF8F5', 
  textMuted: '#C5B4A9', // Warm beige muted text
  textLight: '#9A887D', // Dimmer brown-grey text
  border: '#2E221B', // Dark warm brown border
  locked: '#2B231F', // Disabled button brown
  
  success: '#1FBE56',
  successBg: 'rgba(31, 190, 86, 0.12)',
  error: '#FF4B4B',
  errorBg: 'rgba(255, 75, 75, 0.15)',
  heart: '#FF4B81',
  heartEmpty: '#3E312B',
  shadow: 'rgba(0, 0, 0, 0.4)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const type = {
  display: 30,
  title: 24,
  heading: 20,
  body: 14,
  caption: 12,
  micro: 10,
};

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
  black: 'PlusJakartaSans_800ExtraBold',
};

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const ui = {
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  elevatedCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    ...shadows.card,
  },
  compactCardPadding: spacing.md,
  screenPadding: spacing.md,
  bottomTabHeight: 66,
};

export const game = {
  maxHearts: MAX_HEARTS,
};
