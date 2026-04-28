/**
 * Tokens según prototipo Figma:
 * - Storefront: landing clara (gradiente blanco → gris #F3F4F6, texto #000 / secundario #6B7280, badge #DBEAFE).
 * - Auth: login oscuro (#000 fondo, tarjetas #111, serif en titulares).
 */
export const storefront = {
  colors: {
    /** Fondo página (catálogo, carrito, cuentas): #F9FAFB */
    page: '#F9FAFB',
    pageCenter: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceMuted: '#F9FAFB',
    /** Campo búsqueda pill en header */
    searchField: '#F3F4F6',
    /** Iconos “trust” / highlights */
    featureIconBg: '#EFF6FF',
    featureIcon: '#2563EB',
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    text: {
      primary: '#000000',
      secondary: '#6B7280',
      muted: '#9CA3AF',
    },
    badge: {
      bg: '#DBEAFE',
      text: '#1E40AF',
    },
    /** Botón primario tipo prototipo: negro sobre blanco */
    buttonPrimary: '#000000',
    buttonPrimaryText: '#FFFFFF',
    /** Insignia carrito y acentos vibrantes (Figma) */
    cartBadge: '#2563EB',
    cartBadgeText: '#FFFFFF',
  },
  shadow: {
    nav: '0 1px 0 rgba(0,0,0,0.06)',
    card: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
    cardHover: '0 4px 24px rgba(0,0,0,0.08)',
  },
};

/** Pantallas login / registro (captura oscura) */
export const auth = {
  colors: {
    page: '#000000',
    surface: '#111111',
    surfaceElevated: '#18181B',
    border: 'rgba(255, 255, 255, 0.1)',
    borderStrong: 'rgba(255, 255, 255, 0.14)',
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1AA',
      muted: '#71717A',
    },
    input: '#0A0A0A',
    /** Checkbox “Remember me” */
    accent: '#3B82F6',
    buttonPrimary: '#FFFFFF',
    buttonPrimaryText: '#000000',
  },
};

/** Tipografía: Inter UI; serif solo en auth / titulares específicos */
export const fontFamily = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  serif: ['Instrument Serif', 'Georgia', 'serif'],
};

export default { storefront, auth, fontFamily };
