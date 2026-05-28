/** Taxonomía de categorías para publicación de productos (3 niveles → array API). */
export const PRODUCT_CATEGORY_TREE = [
  {
    id: 'tecnologia',
    label: 'Tecnología',
    subcategories: [
      {
        id: 'computadores',
        label: 'Computadores',
        lines: ['Portátiles', 'De escritorio', 'Tablets', 'Accesorios PC'],
      },
      {
        id: 'perifericos',
        label: 'Periféricos',
        lines: ['Teclados', 'Mouse', 'Monitores', 'Audífonos'],
      },
      {
        id: 'celulares',
        label: 'Celulares',
        lines: ['Smartphones', 'Fundas', 'Cargadores'],
      },
    ],
  },
  {
    id: 'moda',
    label: 'Moda',
    subcategories: [
      {
        id: 'ropa',
        label: 'Ropa',
        lines: ['Camisetas', 'Pantalones', 'Vestidos', 'Chaquetas'],
      },
      {
        id: 'calzado',
        label: 'Calzado',
        lines: ['Deportivos', 'Formales', 'Sandalias'],
      },
      {
        id: 'accesorios-moda',
        label: 'Accesorios',
        lines: ['Bolsos', 'Relojes', 'Gafas'],
      },
    ],
  },
  {
    id: 'hogar',
    label: 'Hogar',
    subcategories: [
      {
        id: 'muebles',
        label: 'Muebles',
        lines: ['Sillas', 'Mesas', 'Estanterías'],
      },
      {
        id: 'decoracion',
        label: 'Decoración',
        lines: ['Cuadros', 'Plantas', 'Iluminación'],
      },
      {
        id: 'cocina',
        label: 'Cocina',
        lines: ['Utensilios', 'Electrodomésticos pequeños'],
      },
    ],
  },
  {
    id: 'deportes',
    label: 'Deportes',
    subcategories: [
      {
        id: 'fitness',
        label: 'Fitness',
        lines: ['Mancuernas', 'Colchonetas', 'Bandas elásticas'],
      },
      {
        id: 'outdoor',
        label: 'Outdoor',
        lines: ['Camping', 'Ciclismo', 'Running'],
      },
    ],
  },
  {
    id: 'belleza',
    label: 'Belleza',
    subcategories: [
      {
        id: 'cuidado-personal',
        label: 'Cuidado personal',
        lines: ['Cuidado capilar', 'Cuidado facial', 'Perfumes'],
      },
      {
        id: 'maquillaje',
        label: 'Maquillaje',
        lines: ['Labiales', 'Bases', 'Accesorios'],
      },
    ],
  },
];

/**
 * @param {string | null | undefined} mainId
 */
export function subcategoriesForMain(mainId) {
  const main = PRODUCT_CATEGORY_TREE.find((c) => c.id === mainId);
  return main?.subcategories ?? [];
}

/**
 * @param {string | null | undefined} mainId
 * @param {string | null | undefined} subId
 */
export function linesForSubcategory(mainId, subId) {
  const sub = subcategoriesForMain(mainId).find((s) => s.id === subId);
  return sub?.lines ?? [];
}

/**
 * @param {{ mainId?: string; subId?: string; line?: string }} selection
 * @returns {string[]}
 */
export function buildCategoriasFromSelection({ mainId, subId, line }) {
  const main = PRODUCT_CATEGORY_TREE.find((c) => c.id === mainId);
  const sub = subcategoriesForMain(mainId).find((s) => s.id === subId);
  const out = [];
  if (main?.label) out.push(main.label);
  if (sub?.label) out.push(sub.label);
  if (line?.trim()) out.push(line.trim());
  return out;
}
