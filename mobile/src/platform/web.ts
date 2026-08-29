import { Platform } from 'react-native';

/**
 * Safely checks if execution is running in a browser environment.
 */
export const isWeb = (): boolean => Platform.OS === 'web' && typeof window !== 'undefined';

/**
 * Safely parses search params from browser window location.
 */
export const getUrlSearchParams = (): URLSearchParams | null => {
  if (!isWeb() || !window.location) return null;
  return new URLSearchParams(window.location.search);
};

/**
 * Constructs a shareable URL for an event.
 */
export const getEventShareUrl = (eventId: number): string => {
  if (isWeb() && window.location) {
    return `${window.location.origin}${window.location.pathname}?event=${eventId}`;
  }
  return `https://trianglesocial.app/?event=${eventId}`;
};

/**
 * Cross-platform web share or fallback clipboard helper.
 */
export const shareNativeWeb = async (title: string, text: string, url: string): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    try {
      await (navigator as any).share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }
  return false;
};
