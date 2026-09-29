import { AppTheme, Track } from '../types';

/**
 * Material 3 Expressive Tonal Palettes (Pixel / Material You)
 */
export const MATERIAL_YOU_PRESETS: Record<string, AppTheme> = {
  pixel_monet_dark: {
    id: 'pixel_monet_dark',
    name: 'Pixel Material You (Dark)',
    isMaterialYou: true,
    background: '#121318',
    surface: '#1A1C22',
    surfaceLight: '#242730',
    surfaceBorder: 'rgba(255, 255, 255, 0.08)',
    accent: '#A8C7FA',
    accentGlow: 'rgba(168, 199, 250, 0.28)',
    textPrimary: '#E2E2E9',
    textSecondary: '#C4C6D0',
    textTertiary: '#8E9099',
    playerBarBg: 'rgba(26, 28, 34, 0.94)',
    cardBg: '#1E2026',
    danger: '#F2B8B5',
    success: '#87D7A0',
    primaryContainer: '#004A77',
    onPrimaryContainer: '#D1E4FF',
    surfaceContainer: '#1E2026',
    surfaceContainerHigh: '#282A30',
    outlineVariant: 'rgba(142, 144, 153, 0.2)',
  },
  pixel_monet_light: {
    id: 'pixel_monet_light',
    name: 'Pixel Material You (Light)',
    isMaterialYou: true,
    background: '#F9F9FF',
    surface: '#EDEFFF',
    surfaceLight: '#E0E2F0',
    surfaceBorder: 'rgba(0, 0, 0, 0.08)',
    accent: '#0061A4',
    accentGlow: 'rgba(0, 97, 164, 0.2)',
    textPrimary: '#191C20',
    textSecondary: '#44474E',
    textTertiary: '#74777F',
    playerBarBg: 'rgba(237, 239, 255, 0.94)',
    cardBg: '#FFFFFF',
    danger: '#BA1A1A',
    success: '#146C2E',
    primaryContainer: '#D1E4FF',
    onPrimaryContainer: '#001D36',
    surfaceContainer: '#ECEEF6',
    surfaceContainerHigh: '#E6E8F0',
    outlineVariant: 'rgba(116, 119, 127, 0.2)',
  },
  pixel_terracotta: {
    id: 'pixel_terracotta',
    name: 'Pixel Warm Terracotta',
    isMaterialYou: true,
    background: '#191211',
    surface: '#231917',
    surfaceLight: '#2F2320',
    surfaceBorder: 'rgba(255, 255, 255, 0.08)',
    accent: '#FFB5A0',
    accentGlow: 'rgba(255, 181, 160, 0.28)',
    textPrimary: '#F1DFDA',
    textSecondary: '#D8C2BC',
    textTertiary: '#A08C87',
    playerBarBg: 'rgba(35, 25, 23, 0.94)',
    cardBg: '#271D1B',
    danger: '#F2B8B5',
    success: '#87D7A0',
    primaryContainer: '#5C1D0D',
    onPrimaryContainer: '#FFDAD2',
    surfaceContainer: '#271D1B',
    surfaceContainerHigh: '#322724',
    outlineVariant: 'rgba(160, 140, 135, 0.2)',
  },
  pixel_amethyst: {
    id: 'pixel_amethyst',
    name: 'Pixel Amethyst Velvet',
    isMaterialYou: true,
    background: '#151219',
    surface: '#1F1A25',
    surfaceLight: '#2B2433',
    surfaceBorder: 'rgba(255, 255, 255, 0.08)',
    accent: '#D0BCFF',
    accentGlow: 'rgba(208, 188, 255, 0.28)',
    textPrimary: '#E6E0E9',
    textSecondary: '#CAC4D0',
    textTertiary: '#938F99',
    playerBarBg: 'rgba(31, 26, 37, 0.94)',
    cardBg: '#241E2B',
    danger: '#F2B8B5',
    success: '#87D7A0',
    primaryContainer: '#4F378B',
    onPrimaryContainer: '#EADDFF',
    surfaceContainer: '#241E2B',
    surfaceContainerHigh: '#2F2837',
    outlineVariant: 'rgba(147, 143, 153, 0.2)',
  },
};

/**
 * Offline color generator that creates an adaptive Material You tonal palette
 * from track metadata / album artwork without requiring internet access.
 */
export function extractDynamicThemeFromTrack(track: Track, baseTheme: AppTheme): AppTheme {
  const seedString = `${track.artist}-${track.album || track.title}-${track.genre || ''}`;

  // Deterministic 32-bit hash calculation
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }

  // Generate HSL hue (0 to 360) and pleasing Material 3 saturation
  const hue = Math.abs(hash) % 360;
  const isLight = baseTheme.id.includes('light');

  if (isLight) {
    const accent = `hsl(${hue}, 65%, 42%)`;
    const accentGlow = `hsla(${hue}, 65%, 42%, 0.25)`;
    const bg = `hsl(${hue}, 20%, 97%)`;
    const surf = `hsl(${hue}, 25%, 93%)`;
    const surfLight = `hsl(${hue}, 25%, 88%)`;
    const primCont = `hsl(${hue}, 60%, 88%)`;
    const onPrimCont = `hsl(${hue}, 80%, 15%)`;

    return {
      ...baseTheme,
      id: `dynamic_${track.id}`,
      name: `Dynamic (${track.title})`,
      isMaterialYou: true,
      background: bg,
      surface: surf,
      surfaceLight: surfLight,
      surfaceBorder: `hsla(${hue}, 30%, 40%, 0.12)`,
      accent,
      accentGlow,
      textPrimary: '#1A1C1E',
      textSecondary: '#43474E',
      textTertiary: '#73777F',
      playerBarBg: `hsla(${hue}, 25%, 93%, 0.94)`,
      cardBg: '#FFFFFF',
      primaryContainer: primCont,
      onPrimaryContainer: onPrimCont,
      surfaceContainer: surf,
      surfaceContainerHigh: surfLight,
    };
  }

  // Dark Mode Dynamic Monet
  const accent = `hsl(${hue}, 85%, 75%)`;
  const accentGlow = `hsla(${hue}, 85%, 75%, 0.28)`;
  const bg = `hsl(${hue}, 28%, 6%)`;
  const surf = `hsl(${hue}, 24%, 10%)`;
  const surfLight = `hsl(${hue}, 22%, 15%)`;
  const primCont = `hsl(${hue}, 55%, 25%)`;
  const onPrimCont = `hsl(${hue}, 85%, 90%)`;

  return {
    ...baseTheme,
    id: `dynamic_${track.id}`,
    name: `Dynamic (${track.title})`,
    isMaterialYou: true,
    background: bg,
    surface: surf,
    surfaceLight: surfLight,
    surfaceBorder: `hsla(${hue}, 40%, 80%, 0.10)`,
    accent,
    accentGlow,
    textPrimary: '#F1F0F4',
    textSecondary: '#C5C6D0',
    textTertiary: '#8F909A',
    playerBarBg: `hsla(${hue}, 24%, 10%, 0.94)`,
    cardBg: `hsl(${hue}, 22%, 12%)`,
    primaryContainer: primCont,
    onPrimaryContainer: onPrimCont,
    surfaceContainer: `hsl(${hue}, 22%, 12%)`,
    surfaceContainerHigh: surfLight,
  };
}
