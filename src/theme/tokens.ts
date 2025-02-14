export const colors = {
  // Brand colors
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#4F46E5', // Main brand color
    600: '#4338CA',
    700: '#3730A3',
    800: '#312E81',
    900: '#1E1B4B',
  },
  // Neutral colors
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  // Semantic colors
  success: {
    light: '#10B981',
    dark: '#059669',
  },
  error: {
    light: '#EF4444',
    dark: '#DC2626',
  },
  warning: {
    light: '#F59E0B',
    dark: '#D97706',
  },
  info: {
    light: '#3B82F6',
    dark: '#2563EB',
  },
};

export const typography = {
  fonts: {
    primary: 'System',
    secondary: 'System',
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  none: 'none',
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 5,
  },
};

export const zIndices = {
  base: 0,
  drawer: 40,
  modal: 50,
  toast: 60,
};

// Common component-specific tokens
export const components = {
  button: {
    sizes: {
      sm: {
        height: 32,
        padding: spacing.sm,
        fontSize: typography.sizes.sm,
      },
      md: {
        height: 40,
        padding: spacing.md,
        fontSize: typography.sizes.base,
      },
      lg: {
        height: 48,
        padding: spacing.lg,
        fontSize: typography.sizes.lg,
      },
    },
  },
  input: {
    sizes: {
      sm: {
        height: 32,
        padding: spacing.sm,
        fontSize: typography.sizes.sm,
      },
      md: {
        height: 40,
        padding: spacing.md,
        fontSize: typography.sizes.base,
      },
      lg: {
        height: 48,
        padding: spacing.lg,
        fontSize: typography.sizes.lg,
      },
    },
  },
};
