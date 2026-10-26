export const LightTheme = {
  dark: false,
  bg: '#f8f9fa',
  bgElevated: '#ffffff',
  bgSecondary: '#f1f3f5',
  textPrimary: '#1a1a1a',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',
  accent: '#6366f1',
  accentText: '#ffffff',
  overlay: 'rgba(0,0,0,0.4)',
};

export const DarkTheme = {
  dark: true,
  bg: '#0a0a0a',
  bgElevated: '#1a1a1a',
  bgSecondary: '#161618',
  textPrimary: '#f5f5f5',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
  border: '#27272a',
  borderStrong: '#3f3f46',
  accent: '#818cf8',
  accentText: '#0a0a0a',
  overlay: 'rgba(0,0,0,0.6)',
};

export type Theme = typeof LightTheme;

export const CONDITIONS = [
  'Gem Mint',
  'Mint',
  'Near Mint',
  'Lightly Played',
  'Moderately Played',
  'Heavily Played',
  'Damaged',
];

export const COLLECTION_ICONS = [
  '📦', '⚡', '🃏', '⚾', '🎴', '✨', '🎮', '🏀',
  '🏈', '⚽', '🏆', '🎨', '📚', '🎵', '💎', '🔥',
];

export const COLLECTION_COLORS = [
  '#6366f1', '#f59e0b', '#ef4444', '#10b981',
  '#ec4899', '#8b5cf6', '#06b6d4', '#f97316',
  '#3b82f6', '#84cc16', '#e11d48', '#14b8a6',
];

export const Typography = {
  fontFamilyRegular: 'Inter-Regular',
  fontFamilyMedium: 'Inter-Medium',
  fontFamilySemiBold: 'Inter-SemiBold',
  fontFamilyBold: 'Inter-Bold',
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
};
