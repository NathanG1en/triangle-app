export const colors = {
  // Foundation (85-90% of UI)
  paper: '#FFFEFD',        // Warm off-white page background
  ink: '#1A1A1A',          // Deep warm black text & crisp borders
  surface: '#F5F1EC',      // Soft warm secondary surface for cards/pills
  surfaceHover: '#EBE5DC',  // Slightly darker surface for active states
  muted: '#77736F',        // Secondary text & metadata
  ticketBorder: '#E2DDD7',  // Fine divider line color
  cardShadow: 'rgba(26, 26, 26, 0.08)',

  // Earthy / Social Accent Palette
  coral: '#D95F4B',        // Primary emphasis / active badges
  forest: '#075E59',       // Outdoor / fresh events
  aubergine: '#67295F',    // Arts & Music
  lilac: '#C8C4E8',        // Social tags
  sand: '#E8D7CC',         // Secondary warm pills
  gold: '#D97706',         // Featured & star actions
};

export const categoryColors: Record<string, { bg: string; text: string; border?: string }> = {
  'Food & Drink': { bg: '#FCE7D7', text: '#B45309' },
  'Outdoor & Fitness': { bg: '#D1EBE7', text: '#075E59' },
  'Tech & Professional': { bg: '#E2E0F4', text: '#4338CA' },
  'Arts & Music': { bg: '#F5DCEE', text: '#67295F' },
  'Sports': { bg: '#FED7AA', text: '#C2410C' },
  'Social': { bg: '#E8D7CC', text: '#78350F' },
};
