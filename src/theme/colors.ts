export const colors = {
  // Surfaces
  background:       '#F4EFE6',
  surface:          '#FAF7F2',
  surfaceElevated:  '#FFFFFF',
  card:             '#FAF7F2',

  // Brand — Sage Green
  primary:          '#7A9E6E',
  primaryDark:      '#4A6B3E',
  primaryLight:     '#C3D9B8',
  primarySubtle:    '#EBF3E6',
  primaryMuted:     '#8FA87A',

  // Accent — Terracotta
  accent:           '#C4623A',
  accentLight:      '#E8956D',
  accentSubtle:     '#F5E2D8',

  // Text
  textPrimary:      '#2C2118',
  textSecondary:    '#7A6855',
  textMuted:        '#B0A090',
  textInverse:      '#FAF7F2',

  // Borders
  border:           '#E0D5C5',
  borderLight:      '#EDE5D8',

  // Semantic
  warning:          '#E8A83A',
  error:            '#C4623A',
  success:          '#7A9E6E',
  info:             '#8BA0B4',

  // Nutrition data tokens
  calories:         '#C4623A',
  carbs:            '#7A9E6E',
  sodium:           '#A08B5E',

  // Gut rating
  gutExcellent:     '#4A6B3E',
  gutVeryGood:      '#7A9E6E',
  gutGood:          '#E8A83A',
  gutModerate:      '#E8956D',
  gutPoor:          '#C4623A',

  // Phase colors (used in accent bars)
  phaseEarly:       '#E8A83A',
  phaseMid:         '#7A9E6E',
  phaseLate:        '#C4623A',
  phaseNight:       '#2C3E50',
  phaseFinal:       '#9A8870',

  // Food category chips
  chipGel:          '#C4623A',
  chipBar:          '#A08B5E',
  chipChew:         '#E8956D',
  chipDrink:        '#8BA0B4',
  chipRealFood:     '#7A9E6E',
  chipNutButter:    '#A08B5E',
  chipFreezeDried:  '#8FA87A',

  // Overlay
  overlay:          'rgba(44, 33, 24, 0.55)',

  white:            '#FFFFFF',
  black:            '#000000',
  transparent:      'transparent',
} as const;

export type ColorName = keyof typeof colors;
