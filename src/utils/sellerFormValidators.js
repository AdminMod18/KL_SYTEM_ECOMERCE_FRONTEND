/** Alineado con {@code DocumentoIdentidadFormatoHandler} (solicitud-service). */
const DOCUMENTO_NORMALIZADO = /^[A-Za-z0-9]{5,32}$/;

/** Alineado con {@code TelefonoBasicoHandler}. */
const TELEFONO = /^[0-9+()\-\s]{7,40}$/;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Documento solo alfanumérico para el API (NIT con guión: se eliminan separadores al comparar / enviar).
 * @param {string} raw
 * @returns {string}
 */
export function normalizarDocumentoIdentidad(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/[^A-Za-z0-9]/g, '');
}

/**
 * @param {string} raw
 * @returns {string | null} mensaje de error o null si OK
 */
export function validarNombresOApellidos(raw, etiqueta) {
  const s = String(raw ?? '').trim();
  if (!s) return `${etiqueta}: es obligatorio.`;
  if (s.length > 120) return `${etiqueta}: máximo 120 caracteres.`;
  return null;
}

/**
 * @param {string} raw
 * @returns {string | null}
 */
export function validarDocumentoIdentidad(raw) {
  const d = normalizarDocumentoIdentidad(raw);
  if (!d) return 'Documento: es obligatorio.';
  if (!DOCUMENTO_NORMALIZADO.test(d)) {
    return 'Documento: entre 5 y 32 caracteres alfanuméricos (sin espacios; puede omitir guiones del NIT).';
  }
  return null;
}

/**
 * @param {string} raw
 * @returns {string | null}
 */
export function validarCorreo(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return 'Correo: es obligatorio.';
  if (s.length > 320) return 'Correo: máximo 320 caracteres.';
  if (!EMAIL_RE.test(s)) return 'Correo: formato no válido (ejemplo: nombre@dominio.com).';
  return null;
}

/**
 * @param {string} raw
 * @returns {string | null}
 */
export function validarPaisOCiudad(raw, etiqueta) {
  const s = String(raw ?? '').trim();
  if (!s) return `${etiqueta}: es obligatorio.`;
  if (s.length > 120) return `${etiqueta}: máximo 120 caracteres.`;
  return null;
}

/**
 * @param {string} raw
 * @returns {string | null}
 */
export function validarTelefono(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return 'Teléfono: es obligatorio.';
  if (!TELEFONO.test(s)) {
    return 'Teléfono: entre 7 y 40 caracteres; solo dígitos, espacios, +, paréntesis y guiones.';
  }
  return null;
}

/**
 * @param {string} raw
 * @returns {string | null}
 */
export function validarNombreComercialOpcional(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (s.length > 200) return 'Nombre comercial: máximo 200 caracteres.';
  return null;
}

/**
 * Validación previa al POST de creación de solicitud (campos de texto).
 * @param {{
 *   nombres: string;
 *   apellidos: string;
 *   documentoIdentidad: string;
 *   correoElectronico: string;
 *   paisResidencia: string;
 *   ciudadResidencia: string;
 *   telefono: string;
 *   nombreVendedor?: string;
 * }} p
 * @returns {{ error: string } | { error: null; documentoNormalizado: string }}
 */
export function validarCamposSolicitudVendedor(p) {
  const e1 = validarNombresOApellidos(p.nombres, 'Nombres');
  if (e1) return { error: e1 };
  const e2 = validarNombresOApellidos(p.apellidos, 'Apellidos');
  if (e2) return { error: e2 };
  const eDoc = validarDocumentoIdentidad(p.documentoIdentidad);
  if (eDoc) return { error: eDoc };
  const eCorreo = validarCorreo(p.correoElectronico);
  if (eCorreo) return { error: eCorreo };
  const ePais = validarPaisOCiudad(p.paisResidencia, 'País de residencia');
  if (ePais) return { error: ePais };
  const eCiudad = validarPaisOCiudad(p.ciudadResidencia, 'Ciudad de residencia');
  if (eCiudad) return { error: eCiudad };
  const eTel = validarTelefono(p.telefono);
  if (eTel) return { error: eTel };
  const eNv = validarNombreComercialOpcional(p.nombreVendedor ?? '');
  if (eNv) return { error: eNv };
  return { error: null, documentoNormalizado: normalizarDocumentoIdentidad(p.documentoIdentidad) };
}

/**
 * @param {string} documentoForm
 * @param {string} documentoSolicitudApi
 * @returns {string | null}
 */
export function validarDocumentoCoincideSolicitud(documentoForm, documentoSolicitudApi) {
  const a = normalizarDocumentoIdentidad(documentoForm);
  const b = normalizarDocumentoIdentidad(documentoSolicitudApi);
  if (!a) return 'Documento: es obligatorio.';
  const e = validarDocumentoIdentidad(documentoForm);
  if (e) return e;
  if (a.toLowerCase() !== b.toLowerCase()) {
    return 'Documento: debe coincidir exactamente con el registrado en la solicitud (misma normalización: sin guiones ni espacios).';
  }
  return null;
}

/**
 * @param {unknown} score
 * @returns {string | null}
 */
export function validarScoreCifin(score) {
  if (score === '' || score == null || (typeof score === 'string' && String(score).trim() === '')) {
    return 'Indicador (score): es obligatorio.';
  }
  const n = typeof score === 'number' ? score : Number(String(score).trim());
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    return 'Indicador (score): ingrese un número entero válido.';
  }
  const t = Math.trunc(n);
  if (t < 0 || t > 9999) return 'Indicador (score): debe estar entre 0 y 9999.';
  return null;
}

/**
 * @param {unknown} monto
 * @returns {string | null}
 */
export function validarMontoActivacion(monto) {
  const n = typeof monto === 'number' ? monto : Number(String(monto ?? '').trim().replace(',', '.'));
  if (!Number.isFinite(n) || Number.isNaN(n)) return 'Monto: ingrese un valor numérico válido.';
  if (n < 0.01) return 'Monto: el valor mínimo es 0,01.';
  if (n > 999_999_999.99) return 'Monto: valor demasiado alto.';
  return null;
}

/**
 * @param {'ONLINE'|'TARJETA'|'CONSIGNACION'} tipo
 * @param {{ tokenPasarela?: string; ultimosDigitosTarjeta?: string; numeroComprobante?: string }} campos
 * @returns {string | null}
 */
export function validarCamposActivacionPorTipo(tipo, campos) {
  if (tipo === 'ONLINE') {
    const t = String(campos.tokenPasarela ?? '').trim();
    if (!t) return 'Token de pasarela: es obligatorio para pago ONLINE.';
    if (t.length > 128) return 'Token de pasarela: máximo 128 caracteres.';
    return null;
  }
  if (tipo === 'TARJETA') {
    const d = String(campos.ultimosDigitosTarjeta ?? '').trim();
    if (!/^\d{4}$/.test(d)) return 'Últimos 4 dígitos: ingrese exactamente 4 números.';
    return null;
  }
  if (tipo === 'CONSIGNACION') {
    const c = String(campos.numeroComprobante ?? '').trim();
    if (c.length > 64) return 'Número de comprobante: máximo 64 caracteres.';
    if (c && !/^[A-Za-z0-9._\-/]+$/.test(c)) {
      return 'Número de comprobante: use solo letras, números y . _ - /';
    }
    return null;
  }
  return 'Tipo de pago no reconocido.';
}

const CATEGORIA_MAX = 120;

/**
 * @param {{
 *   nombre: string;
 *   precio: string | number;
 *   descripcion: string;
 *   categorias?: string[];
 *   categoriasTexto?: string;
 *   marca?: string;
 *   subcategoria?: string;
 *   color?: string;
 *   tamano?: string;
 *   talla?: string;
 *   cantidadStock?: string;
 *   pesoGramos?: string;
 * }} p
 * @returns {string | null}
 */
export function validarFormularioProductoVendedor(p) {
  const nombre = String(p.nombre ?? '').trim();
  if (!nombre) return 'Nombre del producto: es obligatorio.';
  if (nombre.length > 200) return 'Nombre del producto: máximo 200 caracteres.';

  const precioRaw = String(p.precio ?? '').trim().replace(',', '.');
  const precio = Number(precioRaw);
  if (!Number.isFinite(precio) || precio < 0.01) {
    return 'Precio: ingrese un número mayor o igual a 0,01.';
  }
  if (precio > 999_999_999.99) return 'Precio: valor demasiado alto.';

  const desc = String(p.descripcion ?? '').trim();
  if (!desc) return 'Descripción: es obligatoria.';
  if (desc.length > 500) return 'Descripción: máximo 500 caracteres.';

  const categorias = Array.isArray(p.categorias)
    ? p.categorias.map((s) => String(s ?? '').trim()).filter(Boolean)
    : String(p.categoriasTexto ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
  if (!categorias.length) return 'Categorías: seleccione categoría, subcategoría y tipo.';
  for (let i = 0; i < categorias.length; i += 1) {
    const c = categorias[i];
    if (c.length > CATEGORIA_MAX) {
      return `Categoría "${c.slice(0, 24)}…": cada una admite máximo ${CATEGORIA_MAX} caracteres.`;
    }
  }

  const marca = String(p.marca ?? '').trim();
  if (marca.length > 120) return 'Marca: máximo 120 caracteres.';
  const sub = String(p.subcategoria ?? '').trim();
  if (sub.length > 120) return 'Subcategoría: máximo 120 caracteres.';
  const color = String(p.color ?? '').trim();
  if (color.length > 80) return 'Color: máximo 80 caracteres.';
  const tam = String(p.tamano ?? '').trim();
  if (tam.length > 80) return 'Tamaño: máximo 80 caracteres.';
  const talla = String(p.talla ?? '').trim();
  if (talla.length > 40) return 'Talla: máximo 40 caracteres.';

  const stockRaw = String(p.cantidadStock ?? '').trim();
  if (stockRaw) {
    const stock = Number(stockRaw);
    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      return 'Cantidad en stock: número entero mayor o igual a 0.';
    }
  }

  const pesoRaw = String(p.pesoGramos ?? '').trim();
  if (pesoRaw) {
    const peso = Number(pesoRaw);
    if (!Number.isFinite(peso) || peso < 0 || !Number.isInteger(peso)) {
      return 'Peso (gramos): número entero mayor o igual a 0.';
    }
  }

  return null;
}
