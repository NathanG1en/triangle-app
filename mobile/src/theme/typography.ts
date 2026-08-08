import { Platform } from 'react-native';

export const typography = {
  // Editorial Display Serif (Headlines, Featured titles)
  displayFont: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Playfair Display, Georgia, serif',
  }),

  // Functional UI Sans-Serif (Buttons, Metadata, Body)
  sansFont: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'Inter, system-ui, -apple-system, sans-serif',
  }),

  // Type Scale
  scale: {
    hero: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
    pageTitle: { fontSize: 26, lineHeight: 32, fontWeight: '700' as const },
    sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
    cardTitle: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
    body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
    metadata: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
    label: { fontSize: 11, lineHeight: 15, fontWeight: '700' as const, letterSpacing: 0.8 },
  },
};
