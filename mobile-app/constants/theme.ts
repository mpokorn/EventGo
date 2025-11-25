// Theme colors and spacing
export const colors = {
  primary: '#667eea',
  primaryDark: '#5568d3',
  secondary: '#764ba2',
  background: '#0f1724',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  text: '#ffffff',
  textSecondary: '#a0aec0',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  inputBg: 'rgba(255, 255, 255, 0.1)',
  inputBorder: 'rgba(255, 255, 255, 0.2)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  tiny: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};
