import { Platform } from 'react-native';

export function injectWebFonts() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;

  const fontId = 'google-casual-fonts';
  if (document.getElementById(fontId)) return;

  const fontUrl = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Caveat:wght@600;700&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,600&family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Space+Grotesk:wght@600;700&display=swap';

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = fontUrl;
  document.head.appendChild(link);

  // Inject CSS style rule for web font family declarations
  const style = document.createElement('style');
  style.id = 'font-family-declarations';
  style.textContent = `
    @import url('${fontUrl}');
    body, button, input, select, textarea {
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}
