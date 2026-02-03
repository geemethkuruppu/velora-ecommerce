export const theme = {
  colors: {
    primary: '#000B18', // Deep Navy Blue
    secondary: '#D4AF37', // Golden Beige
    background: '#F8F9FA', // Light Gray/White for contrast
    darkBg: '#000B18',
    card: '#ffffff',
    cardHover: '#f1f1f1',
    textMain: '#000B18',
    textDim: '#4A5568',
    textMuted: '#718096',
    border: '#E2E8F0',
    borderFocus: '#000B18',
    accent: '#D4AF37',
    error: '#ff4d4d',
    success: '#00e676'
  },
  fonts: {
    main: "'Inter', sans-serif",
    accent: "'Playfair Display', serif"
  },
  borderRadius: {
    lg: '12px',
    md: '8px',
    sm: '4px'
  },
  transitions: {
    slow: '0.4s ease',
    fast: '0.2s ease'
  }
};

// Helper to inject theme into CSS variables
export const injectTheme = () => {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  Object.entries(theme.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--font-${key}`, value);
  });
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
  Object.entries(theme.transitions).forEach(([key, value]) => {
    root.style.setProperty(`--transition-${key}`, value);
  });
};
