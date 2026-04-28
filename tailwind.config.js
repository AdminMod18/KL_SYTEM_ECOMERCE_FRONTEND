import tokens from './src/styles/tokens.js';

const sf = tokens.storefront.colors;
const au = tokens.auth.colors;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: sf.page,
        surface: sf.surface,
        'surface-muted': sf.surfaceMuted,
        border: sf.border,
        'border-strong': sf.borderStrong,
        'text-primary': sf.text.primary,
        'text-secondary': sf.text.secondary,
        'text-muted': sf.text.muted,
        'badge-bg': sf.badge.bg,
        'badge-text': sf.badge.text,
        'btn-primary': sf.buttonPrimary,
        'btn-primary-text': sf.buttonPrimaryText,
        'cart-badge': sf.cartBadge,
        'cart-badge-text': sf.cartBadgeText,
        'search-field': sf.searchField,
        'feature-icon-bg': sf.featureIconBg,
        'feature-icon': sf.featureIcon,
        brand: {
          DEFAULT: sf.buttonPrimary,
          hover: '#1f2937',
          soft: '#f3f4f6',
          foreground: sf.buttonPrimaryText,
        },
        accent: {
          DEFAULT: sf.badge.bg,
          hover: '#bfdbfe',
          soft: '#eff6ff',
        },
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#eab308',
        authPage: au.page,
        authSurface: au.surface,
        authElevated: au.surfaceElevated,
        authBorder: au.border,
        authBorderStrong: au.borderStrong,
        authText: au.text.primary,
        authSecondary: au.text.secondary,
        authMuted: au.text.muted,
        authInput: au.input,
        authAccent: au.accent,
        authBtn: au.buttonPrimary,
        authBtnText: au.buttonPrimaryText,
      },
      fontFamily: {
        sans: tokens.fontFamily.sans,
        serif: tokens.fontFamily.serif,
        display: tokens.fontFamily.serif,
      },
      fontSize: {
        'hero-xl': ['clamp(2.25rem, 5vw, 3.75rem)', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-md': ['clamp(1.65rem, 2.5vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        lead: ['1.125rem', { lineHeight: '1.65', fontWeight: '400' }],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        card: tokens.storefront.shadow.card,
        'card-hover': tokens.storefront.shadow.cardHover,
        nav: tokens.storefront.shadow.nav,
        focus: '0 0 0 2px #ffffff, 0 0 0 4px #000000',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        pill: '9999px',
      },
      maxWidth: {
        content: '1120px',
        wide: '1280px',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
