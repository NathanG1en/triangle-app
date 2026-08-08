import React, { createContext, useContext } from 'react';
import { Platform } from 'react-native';
import { injectWebFonts } from './webFonts';

injectWebFonts();

export interface FontTheme {
  displayFont: string;
  sansFont: string;
  handFont: string;
}

export const PLAYFUL_GROTESK_THEME: FontTheme = {
  displayFont: Platform.select({
    web: '"Bricolage Grotesque", system-ui, -apple-system, sans-serif',
    ios: 'System',
    android: 'sans-serif-medium',
    default: '"Bricolage Grotesque", sans-serif',
  }) as string,
  sansFont: Platform.select({
    web: '"Outfit", system-ui, -apple-system, sans-serif',
    ios: 'System',
    android: 'sans-serif',
    default: '"Outfit", sans-serif',
  }) as string,
  handFont: Platform.select({
    web: '"Caveat", cursive',
    default: '"Caveat", cursive',
  }) as string,
};

const FontContext = createContext<FontTheme>(PLAYFUL_GROTESK_THEME);

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FontContext.Provider value={PLAYFUL_GROTESK_THEME}>
      {children}
    </FontContext.Provider>
  );
};

export function useFontTheme(): FontTheme {
  return useContext(FontContext);
}

export const typography = {
  get displayFont() {
    return PLAYFUL_GROTESK_THEME.displayFont;
  },
  get sansFont() {
    return PLAYFUL_GROTESK_THEME.sansFont;
  },
  get handFont() {
    return PLAYFUL_GROTESK_THEME.handFont;
  },
  scale: {
    hero: { fontSize: 30, lineHeight: 36, fontWeight: '700' as const },
    pageTitle: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const },
    sectionTitle: { fontSize: 19, lineHeight: 25, fontWeight: '700' as const },
    cardTitle: { fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
    body: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    metadata: { fontSize: 12, lineHeight: 17, fontWeight: '500' as const },
    label: { fontSize: 10, lineHeight: 14, fontWeight: '800' as const, letterSpacing: 0.8 },
  },
};
