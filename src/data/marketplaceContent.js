/**
 * Copy y taxonomía alineados al prototipo Figma Make:
 * https://foil-peanut-77989849.figma.site/
 */
export const SITE_NAME = 'Mercado';

export const HERO = {
  eyebrow: 'Introducing our Premium Collection',
  title: 'Designed for those who demand more.',
  subtitle:
    "Experience technology that doesn't just work—it inspires. Every detail crafted to perfection, every moment elevated.",
  primaryCta: 'Explore Collection',
  secondaryCta: 'Watch the film',
};

export const STATS = [
  { value: '2M+', label: 'Happy Customers' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Expert Support' },
];

export const CATEGORY_SECTION = {
  eyebrow: 'Shop by Category',
  title: 'Find your perfect match',
  subtitle:
    'Curated collections designed to inspire and elevate your everyday experience.',
};

export const CATEGORIES = [
  { slug: 'audio', title: 'Audio', description: 'Headphones, speakers & sound.' },
  { slug: 'wearables', title: 'Wearables', description: 'Watches & fitness.' },
  { slug: 'computing', title: 'Computing', description: 'Laptops & desktops.' },
  { slug: 'mobile', title: 'Mobile', description: 'Phones & tablets.' },
  { slug: 'photography', title: 'Photography', description: 'Cameras & lenses.' },
  { slug: 'accessories', title: 'Accessories', description: 'Cases, cables & more.' },
];

export const FEATURED_SECTION = {
  eyebrow: 'Featured',
  title: 'Handpicked for you',
};

export const TRUST_SECTION = {
  title: 'Premium quality.',
  titleAccent: 'Unmatched service.',
  subtitle:
    'Join thousands of satisfied customers who trust us for their technology needs. Experience the difference that premium quality makes.',
  pillars: [
    {
      icon: 'check',
      title: 'Authenticity Guaranteed',
      body:
        'Every product is verified and backed by our authenticity guarantee. Shop with complete confidence.',
    },
    {
      icon: 'clock',
      title: 'Fast Delivery',
      body: 'Free express shipping on all orders. Get your products delivered within 2-3 business days.',
    },
    {
      icon: 'chat',
      title: 'Expert Support',
      body: 'Our team of experts is available 24/7 to help you find the perfect product for your needs.',
    },
  ],
};

/** Pie multipilar tipo Figma (Shop / Company / Support) */
/** Preguntas frecuentes genéricas en ficha de producto (HU-17). */
export const PRODUCTO_FAQ_ITEMS = [
  {
    q: '¿El envío está incluido?',
    a: 'Los costos de envío se calculan en el checkout según ciudad y peso. Puede revisar el desglose antes de pagar.',
  },
  {
    q: '¿Hay garantía?',
    a: 'Las condiciones de garantía dependen del vendedor y del tipo de producto. Consulte la descripción o pregunte antes de comprar.',
  },
  {
    q: '¿Puedo devolver el producto?',
    a: 'Las políticas de cambios y devoluciones aplican según reglas del marketplace y del vendedor. Guarde comprobante de compra.',
  },
  {
    q: '¿Cómo contacto al vendedor?',
    a: 'Use la sección de preguntas en esta misma página; el vendedor puede responder públicamente cuando esté disponible.',
  },
];

/** Enlaces HU-03 — formatos descargables (HTML imprimible en /public/formatos). */
export const FORMATOS_LEGALES_VENDEDOR = [
  {
    href: '/formatos/centrales-riesgo.html',
    label: 'Autorización centrales de riesgo',
    description: 'Plantilla para imprimir o guardar como PDF desde el navegador.',
  },
  {
    href: '/formatos/datos-personales.html',
    label: 'Tratamiento de datos personales',
    description: 'Adhesión informada al tratamiento de datos (caso estudio).',
  },
];

export const FOOTER_NAV = {
  tagline: 'Premium technology marketplace — curated devices and accessories.',
  columns: [
    {
      title: 'Shop',
      links: [
        { label: 'Catalog', to: '/catalog' },
        { label: 'Cart', to: '/cart' },
        { label: 'Checkout', to: '/checkout' },
      ],
    },
    {
      title: 'Company',
      links: [{ label: 'Seller', to: '/become-seller' }],
    },
    {
      title: 'Support',
      links: [
        { label: 'Log in', to: '/login' },
        { label: 'Register', to: '/register' },
      ],
    },
  ],
  legal: [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
    { label: 'Cookie Settings', to: '#' },
  ],
};
