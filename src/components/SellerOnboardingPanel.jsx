import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  activarSolicitud,
  createSolicitud,
  getSolicitud,
  validarSolicitud,
} from '../services/sellerService.js';
import { refreshSession, sincronizarVendedorDesdeSolicitud } from '../services/authService.js';
import { FORMATOS_LEGALES_VENDEDOR } from '../data/marketplaceContent.js';
import { createProducto } from '../services/productService.js';
import {
  SELLER_SESSION_CHANGED,
  clearSellerSolicitudIdSession,
  getSellerSolicitudIdFromSession,
  setSellerSolicitudIdSession,
} from '../auth/sellerSession.js';
import { getRequestErrorMessage } from '../utils/apiError.js';
import { compressImageToDataUrl } from '../utils/compressImageToDataUrl.js';
import { fileToBase64String } from '../utils/fileToBase64String.js';
import { parseImagenesUrlsCadena } from '../utils/imagenesUrls.js';
import {
  validarCamposActivacionPorTipo,
  validarCamposSolicitudVendedor,
  validarDocumentoCoincideSolicitud,
  validarFormularioProductoVendedor,
  validarMontoActivacion,
  validarScoreCifin,
} from '../utils/sellerFormValidators.js';

/** Límite por archivo (PDF o imagen); el cuerpo JSON crece ~4/3 por Base64. */
const MAX_BYTES_ADJUNTO = 3 * 1024 * 1024;
const MIME_ADJUNTO_PERMITIDO = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

function sanitizeNombreArchivo(name, fallback) {
  let n = (name || '').trim() || fallback;
  n = n.replace(/[/\\:*?"<>|]/g, '_');
  if (n.length > 260) n = n.slice(0, 260);
  return n || fallback;
}

function adjuntoArchivoTipoPermitido(file) {
  if (MIME_ADJUNTO_PERMITIDO.has(file.type)) return true;
  const n = (file.name || '').toLowerCase();
  return /\.(pdf|jpe?g|png|webp)$/i.test(n);
}

/**
 * Definición única de adjuntos por tipo de persona (etiquetas legales + payload API).
 */
const DEF_ADJUNTOS_NATURAL = [
  {
    tipo: 'CEDULA',
    nombreArchivo: 'cedula.pdf',
    label: 'Fotocopia de la cédula',
    plantillaHref: null,
  },
  {
    tipo: 'ACEPTACION_CENTRALES_RIESGO',
    nombreArchivo: 'centrales-riesgo.pdf',
    label: 'Formato de aceptación de consulta a centrales de riesgo',
    plantillaHref: '/formatos/centrales-riesgo.html',
  },
  {
    tipo: 'ACEPTACION_DATOS_PERSONALES',
    nombreArchivo: 'datos-personales.pdf',
    label: 'Formato de aceptación de tratamiento de datos personales',
    plantillaHref: '/formatos/datos-personales.html',
  },
];

const DEF_ADJUNTOS_JURIDICA = [
  {
    tipo: 'RUT',
    nombreArchivo: 'rut.pdf',
    label: 'RUT',
    plantillaHref: null,
  },
  {
    tipo: 'CAMARA_COMERCIO',
    nombreArchivo: 'camara-comercio.pdf',
    label: 'Cámara de comercio',
    plantillaHref: null,
  },
  {
    tipo: 'ACEPTACION_CENTRALES_RIESGO',
    nombreArchivo: 'centrales-riesgo.pdf',
    label: 'Formato de aceptación de consulta a centrales de riesgo',
    plantillaHref: '/formatos/centrales-riesgo.html',
  },
  {
    tipo: 'ACEPTACION_DATOS_PERSONALES',
    nombreArchivo: 'datos-personales.pdf',
    label: 'Formato de aceptación de tratamiento de datos personales',
    plantillaHref: '/formatos/datos-personales.html',
  },
];

/** Máximo de imágenes combinando subidas locales y URLs (alineado con product-service). */
const MAX_IMAGENES_PRODUCTO = 12;

const ESTADO_CLASS = {
  PENDIENTE: 'border-gray-300 bg-gray-100 text-gray-800',
  APROBADA: 'border-blue-300 bg-blue-50 text-blue-900',
  ACTIVA: 'border-green-400 bg-green-50 text-green-900',
  RECHAZADA: 'border-red-300 bg-red-50 text-red-900',
  DEVUELTA: 'border-amber-300 bg-amber-50 text-amber-950',
  EN_MORA: 'border-orange-300 bg-orange-50 text-orange-900',
  CANCELADA: 'border-gray-400 bg-gray-200 text-gray-800',
};

function badgeClass(estado) {
  return ESTADO_CLASS[estado] ?? 'border-border bg-surface text-text-primary';
}

/** JSON puede traer `estado` como string o (según serialización) como objeto; el badge debe reflejar el microservicio. */
function estadoDesdeSolicitud(s) {
  if (!s || s.estado == null) return null;
  const raw = s.estado;
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'object') {
    if (typeof raw.name === 'string') return raw.name.trim();
    if (typeof raw.estado === 'string') return raw.estado.trim();
  }
  try {
    return String(raw).trim();
  } catch {
    return null;
  }
}

export function SellerOnboardingPanel() {
  const location = useLocation();
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** Evita que un GET tardío (p. ej. del mount) pise el estado tras POST validación / activación. */
  const solicitudFetchSeq = useRef(0);

  const [nombreVendedor, setNombreVendedor] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [documentoIdentidad, setDocumentoIdentidad] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [paisResidencia, setPaisResidencia] = useState('Colombia');
  const [ciudadResidencia, setCiudadResidencia] = useState('Bogota');
  const [telefono, setTelefono] = useState('3001234567');
  const [tipoPersona, setTipoPersona] = useState('NATURAL');
  /** @type {Record<string, File | null>} */
  const [archivosAdjuntos, setArchivosAdjuntos] = useState({});

  const [scoreValidacion, setScoreValidacion] = useState('500');

  const [tipoActivacion, setTipoActivacion] = useState('ONLINE');
  const [periodoSuscripcionPlan, setPeriodoSuscripcionPlan] = useState('MENSUAL');
  const [montoActivacion, setMontoActivacion] = useState('99.9');
  const [tokenPasarela, setTokenPasarela] = useState('tok_demo_ok');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [ultimosDigitosTarjetaActivacion, setUltimosDigitosTarjetaActivacion] = useState('4242');

  const [nombreProducto, setNombreProducto] = useState('');
  const [precioProducto, setPrecioProducto] = useState('');
  const [descripcionProducto, setDescripcionProducto] = useState('');
  const [categoriasProducto, setCategoriasProducto] = useState('Tecnologia, Computadores, Portatiles');
  const [marcaProducto, setMarcaProducto] = useState('');
  const [subcategoriaProducto, setSubcategoriaProducto] = useState('');
  const [originalidadProducto, setOriginalidadProducto] = useState('');
  const [condicionProducto, setCondicionProducto] = useState('NUEVO');
  const [cantidadStockProducto, setCantidadStockProducto] = useState('5');
  const [colorProducto, setColorProducto] = useState('');
  const [tamanoProducto, setTamanoProducto] = useState('');
  const [tallaProducto, setTallaProducto] = useState('');
  const [pesoGramosProducto, setPesoGramosProducto] = useState('');
  const [imagenesUrlsProducto, setImagenesUrlsProducto] = useState('');
  /** @type {Array<{ id: string; dataUrl: string; nombre: string }>} */
  const [imagenesArchivoItems, setImagenesArchivoItems] = useState([]);
  const [subiendoImagenes, setSubiendoImagenes] = useState(false);
  const inputImagenesProductoRef = useRef(null);
  const [productoOk, setProductoOk] = useState('');
  const [tiendaActivaMsg, setTiendaActivaMsg] = useState(false);
  const [syncRolMsg, setSyncRolMsg] = useState('');
  const [syncRolLoading, setSyncRolLoading] = useState(false);
  const [validacionOk, setValidacionOk] = useState('');

  const aplicarSolicitudEnFormulario = useCallback((s) => {
    setSolicitud(s);
    setNombreVendedor(s.nombreVendedor ?? '');
    setNombres(s.nombres ?? '');
    setApellidos(s.apellidos ?? '');
    setDocumentoIdentidad(s.documentoIdentidad ?? '');
    setCorreoElectronico(s.correoElectronico ?? '');
    setPaisResidencia(s.paisResidencia ?? 'Colombia');
    setCiudadResidencia(s.ciudadResidencia ?? 'Bogota');
    setTelefono(s.telefono ?? '');
    setTipoPersona(s.tipoPersona === 'JURIDICA' ? 'JURIDICA' : 'NATURAL');
  }, []);

  /**
   * @param {number|string} id
   * @param {{ preserveLocalOnError?: boolean }} [options] si true, un fallo de red no borra la solicitud en pantalla (útil tras POST).
   */
  const refreshSolicitud = useCallback(
    async (id, options = {}) => {
      const { preserveLocalOnError = false } = options;
      if (!id) return;
      const seq = ++solicitudFetchSeq.current;
      setLoading(true);
      setError('');
      try {
        const s = await getSolicitud(id);
        if (seq !== solicitudFetchSeq.current) {
          return;
        }
        aplicarSolicitudEnFormulario(s);
      } catch (err) {
        if (seq !== solicitudFetchSeq.current) {
          return;
        }
        if (!preserveLocalOnError) {
          setSolicitud(null);
          clearSellerSolicitudIdSession();
        }
        setError(getRequestErrorMessage(err));
      } finally {
        if (seq === solicitudFetchSeq.current) {
          setLoading(false);
        }
      }
    },
    [aplicarSolicitudEnFormulario],
  );

  function normalizePath(p) {
    const x = (p || '/').replace(/\/+$/, '');
    return x || '/';
  }

  /** Cada vez que entras a /seller, trae el estado real del API (evita quedar con datos viejos sin F5). */
  useEffect(() => {
    if (normalizePath(location.pathname) !== '/seller') return;
    const id = getSellerSolicitudIdFromSession();
    if (id != null) {
      void refreshSolicitud(id);
    } else {
      setSolicitud(null);
    }
  }, [location.pathname, refreshSolicitud]);

  useEffect(() => {
    setArchivosAdjuntos({});
  }, [tipoPersona]);

  /** Si el id en sessionStorage cambia (crear solicitud, sync auth, otra pestaña misma ventana), vuelve a cargar. */
  useEffect(() => {
    const onSellerSession = () => {
      if (normalizePath(window.location.pathname) !== '/seller') return;
      const id = getSellerSolicitudIdFromSession();
      if (id != null) void refreshSolicitud(id);
      else setSolicitud(null);
    };
    window.addEventListener(SELLER_SESSION_CHANGED, onSellerSession);
    return () => window.removeEventListener(SELLER_SESSION_CHANGED, onSellerSession);
  }, [refreshSolicitud]);

  /** Al volver a la pestaña, reconciliar con el servidor (p. ej. aprobaron la solicitud desde el panel Director). */
  useEffect(() => {
    let t;
    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      if (normalizePath(window.location.pathname) !== '/seller') return;
      const id = getSellerSolicitudIdFromSession();
      if (id == null) return;
      clearTimeout(t);
      t = setTimeout(() => void refreshSolicitud(id, { preserveLocalOnError: true }), 400);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearTimeout(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [refreshSolicitud]);

  const estado = estadoDesdeSolicitud(solicitud);
  const solicitudId = solicitud?.id ?? null;
  /** PENDIENTE o DEVUELTA: puede llamar a validacion-automatica (reintentos ilimitados, mismo id). */
  const puedeRevalidar = estado === 'PENDIENTE' || estado === 'DEVUELTA';
  const puedeActivar = estado === 'APROBADA';
  const puedePublicar = estado === 'ACTIVA';
  const onboardingBloqueado = estado === 'RECHAZADA' || estado === 'CANCELADA';
  const esDevuelta = estado === 'DEVUELTA';

  async function handleCrearSolicitud(e) {
    e.preventDefault();
    setError('');
    solicitudFetchSeq.current += 1;
    setLoading(true);
    try {
      const nombreMostrar = nombreVendedor.trim();
      const vCampos = validarCamposSolicitudVendedor({
        nombres,
        apellidos,
        documentoIdentidad,
        correoElectronico,
        paisResidencia,
        ciudadResidencia,
        telefono,
        nombreVendedor,
      });
      if (vCampos.error) {
        setError(vCampos.error);
        setLoading(false);
        return;
      }
      const filasAdjunto = tipoPersona === 'JURIDICA' ? DEF_ADJUNTOS_JURIDICA : DEF_ADJUNTOS_NATURAL;
      const adjuntos = [];
      for (const row of filasAdjunto) {
        const file = archivosAdjuntos[row.tipo];
        if (!(file instanceof File)) {
          setError(`Seleccione un archivo para: ${row.label}.`);
          setLoading(false);
          return;
        }
        if (!adjuntoArchivoTipoPermitido(file)) {
          setError(`${row.label}: use PDF o imagen (JPEG, PNG o WebP).`);
          setLoading(false);
          return;
        }
        if (file.size > MAX_BYTES_ADJUNTO) {
          setError(`${row.label}: máximo ${Math.round(MAX_BYTES_ADJUNTO / (1024 * 1024))} MB por archivo.`);
          setLoading(false);
          return;
        }
        const contenidoBase64 = await fileToBase64String(file);
        adjuntos.push({
          tipo: row.tipo,
          nombreArchivo: sanitizeNombreArchivo(file.name, row.nombreArchivo),
          contenidoBase64,
        });
      }
      const creada = await createSolicitud({
        ...(nombreMostrar ? { nombreVendedor: nombreMostrar } : {}),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        documentoIdentidad: vCampos.documentoNormalizado,
        correoElectronico: correoElectronico.trim(),
        paisResidencia: paisResidencia.trim(),
        ciudadResidencia: ciudadResidencia.trim(),
        telefono: telefono.trim(),
        tipoPersona,
        adjuntos,
      });
      setSellerSolicitudIdSession(creada.id);
      aplicarSolicitudEnFormulario({ ...creada });
      setTiendaActivaMsg(false);
      setProductoOk('');
      setValidacionOk('');
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleValidarSolicitud() {
    setValidacionOk('');
    setError('');
    if (solicitudId == null || solicitudId === '') {
      setError('No hay solicitud cargada. Crea una solicitud primero o pulsa Actualizar estado.');
      return;
    }
    const docServidor = solicitud?.documentoIdentidad != null ? String(solicitud.documentoIdentidad) : '';
    if (!docServidor.trim()) {
      setError('No se encontró el documento en la solicitud. Pulse «Actualizar estado» o vuelva a crear la solicitud.');
      return;
    }
    const errDoc = validarDocumentoCoincideSolicitud(documentoIdentidad, docServidor);
    if (errDoc) {
      setError(errDoc);
      return;
    }
    const errScore = validarScoreCifin(scoreValidacion);
    if (errScore) {
      setError(errScore);
      return;
    }
    const scoreNum = Math.trunc(Number(scoreValidacion));

    solicitudFetchSeq.current += 1;

    const payload = {
      documento: docServidor.trim(),
      score: scoreNum,
    };

    setLoading(true);
    try {
      const actualizada = await validarSolicitud(solicitudId, payload);
      const estadoMostrar = estadoDesdeSolicitud(actualizada) ?? 'desconocido';
      aplicarSolicitudEnFormulario({ ...actualizada });
      setValidacionOk(`Validacion completada. Estado actual: ${estadoMostrar}.`);
      const idSync = Number(actualizada?.id ?? solicitudId);
      if (Number.isFinite(idSync)) {
        await refreshSolicitud(idSync, { preserveLocalOnError: true });
      }
    } catch (err) {
      const msg = getRequestErrorMessage(err);
      setError(msg || 'Error al ejecutar la validacion automatica.');
    } finally {
      setLoading(false);
    }
  }

  async function handleActivar(e) {
    e.preventDefault();
    if (!solicitudId) return;
    setError('');
    const errMonto = validarMontoActivacion(montoActivacion);
    if (errMonto) {
      setError(errMonto);
      return;
    }
    const monto = Number(String(montoActivacion ?? '').trim().replace(',', '.'));
    const errPago = validarCamposActivacionPorTipo(tipoActivacion, {
      tokenPasarela,
      ultimosDigitosTarjeta: ultimosDigitosTarjetaActivacion,
      numeroComprobante,
    });
    if (errPago) {
      setError(errPago);
      return;
    }
    solicitudFetchSeq.current += 1;
    setLoading(true);
    try {
      let body;
      const periodoSuscripcion = periodoSuscripcionPlan;
      if (tipoActivacion === 'ONLINE') {
        body = {
          tipo: 'ONLINE',
          monto,
          tokenPasarela: tokenPasarela.trim(),
          periodoSuscripcion,
        };
      } else if (tipoActivacion === 'TARJETA') {
        const dig = ultimosDigitosTarjetaActivacion.trim();
        body = { tipo: 'TARJETA', monto, ultimosDigitosTarjeta: dig, periodoSuscripcion };
      } else {
        const comp = numeroComprobante.trim() || `WEB-ACT-${solicitudId}-${Date.now()}`;
        body = {
          tipo: 'CONSIGNACION',
          monto,
          numeroComprobanteConsignacion: comp,
          periodoSuscripcion,
        };
      }
      const actualizada = await activarSolicitud(solicitudId, body);
      aplicarSolicitudEnFormulario({ ...actualizada });
      const idSync = Number(actualizada?.id ?? solicitudId);
      if (Number.isFinite(idSync)) {
        await refreshSolicitud(idSync, { preserveLocalOnError: true });
      }
      if (actualizada.estado === 'ACTIVA') {
        try {
          const refreshed = await refreshSession();
          const tieneVendedor = (refreshed.roles ?? []).some((r) => String(r).toUpperCase() === 'VENDEDOR');
          if (!tieneVendedor && actualizada.id != null) {
            await sincronizarVendedorDesdeSolicitud(actualizada.id);
          }
        } catch {
          try {
            if (actualizada.id != null) {
              await sincronizarVendedorDesdeSolicitud(actualizada.id);
            }
          } catch {
            /* token caducado u offline */
          }
        }
        setTiendaActivaMsg(true);
      }
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleAgregarImagenesProducto(fileList) {
    const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    setError('');
    const desdeTexto = parseImagenesUrlsCadena(imagenesUrlsProducto).length;
    const cupo = MAX_IMAGENES_PRODUCTO - imagenesArchivoItems.length - desdeTexto;
    if (cupo <= 0) {
      setError(`Máximo ${MAX_IMAGENES_PRODUCTO} imágenes en total (archivos + URLs).`);
      return;
    }
    const tomar = files.slice(0, cupo);
    if (files.length > tomar.length) {
      setError(`Solo se añaden ${tomar.length} archivo(s); el máximo total es ${MAX_IMAGENES_PRODUCTO}.`);
    }
    setSubiendoImagenes(true);
    try {
      const nuevos = [];
      for (const file of tomar) {
        if (file.size > 8 * 1024 * 1024) {
          setError(`${file.name}: máximo 8 MB por archivo.`);
          continue;
        }
        const dataUrl = await compressImageToDataUrl(file);
        nuevos.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          dataUrl,
          nombre: file.name,
        });
      }
      if (nuevos.length) {
        setImagenesArchivoItems((prev) => [...prev, ...nuevos]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : getRequestErrorMessage(err));
    } finally {
      setSubiendoImagenes(false);
    }
  }

  function quitarImagenArchivoProducto(id) {
    setImagenesArchivoItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function handleCrearProducto(e) {
    e.preventDefault();
    if (!solicitudId) return;
    setError('');
    setProductoOk('');
    const errProd = validarFormularioProductoVendedor({
      nombre: nombreProducto,
      precio: precioProducto,
      descripcion: descripcionProducto,
      categoriasTexto: categoriasProducto,
      marca: marcaProducto,
      subcategoria: subcategoriaProducto,
      color: colorProducto,
      tamano: tamanoProducto,
      talla: tallaProducto,
      cantidadStock: cantidadStockProducto,
      pesoGramos: pesoGramosProducto,
    });
    if (errProd) {
      setError(errProd);
      return;
    }
    const categorias = categoriasProducto
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const desdeTexto = parseImagenesUrlsCadena(imagenesUrlsProducto);
    const desdeArchivo = imagenesArchivoItems.map((x) => x.dataUrl);
    const imagenesUrls = [...desdeArchivo, ...desdeTexto];
    if (imagenesUrls.length > MAX_IMAGENES_PRODUCTO) {
      setError(`Máximo ${MAX_IMAGENES_PRODUCTO} imágenes en total (archivos + URLs).`);
      return;
    }
    if (imagenesUrls.some((u) => u.length > 240_000)) {
      setError('Una imagen supera el límite permitido por el servidor; comprime más o usa menos fotos.');
      return;
    }
    setLoading(true);
    try {
      const stock = Number(cantidadStockProducto);
      const pesoG = pesoGramosProducto.trim() ? Number(pesoGramosProducto) : undefined;
      const precioNum = Number(String(precioProducto ?? '').trim().replace(',', '.'));
      const payload = {
        vendedorSolicitudId: solicitudId,
        nombre: nombreProducto.trim(),
        precio: precioNum,
        descripcion: descripcionProducto.trim(),
        categorias,
        cantidadStock: Number.isFinite(stock) ? stock : 1,
      };
      if (marcaProducto.trim()) payload.marca = marcaProducto.trim();
      if (subcategoriaProducto.trim()) payload.subcategoria = subcategoriaProducto.trim();
      if (originalidadProducto) payload.originalidad = originalidadProducto;
      if (condicionProducto) payload.condicion = condicionProducto;
      if (colorProducto.trim()) payload.color = colorProducto.trim();
      if (tamanoProducto.trim()) payload.tamano = tamanoProducto.trim();
      if (tallaProducto.trim()) payload.talla = tallaProducto.trim();
      if (pesoG !== undefined && Number.isFinite(pesoG) && pesoG >= 0) payload.pesoGramos = Math.trunc(pesoG);
      if (imagenesUrls.length) payload.imagenesUrls = imagenesUrls;
      await createProducto(payload);
      setProductoOk('Producto publicado correctamente.');
      setNombreProducto('');
      setPrecioProducto('');
      setDescripcionProducto('');
      setImagenesUrlsProducto('');
      setImagenesArchivoItems([]);
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSincronizarRolSesion() {
    if (solicitudId == null) return;
    setSyncRolMsg('');
    setError('');
    setSyncRolLoading(true);
    try {
      await sincronizarVendedorDesdeSolicitud(solicitudId);
      setSyncRolMsg('Sesión actualizada con los roles del servidor. Si el JWT seguía como comprador, ya debería incluir VENDEDOR.');
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setSyncRolLoading(false);
    }
  }

  function handleNuevaSolicitud() {
    solicitudFetchSeq.current += 1;
    clearSellerSolicitudIdSession();
    setSolicitud(null);
    setLoading(false);
    setError('');
    setSyncRolMsg('');
    setTiendaActivaMsg(false);
    setProductoOk('');
    setValidacionOk('');
    setImagenesUrlsProducto('');
    setImagenesArchivoItems([]);
    setNombreVendedor('');
    setNombres('');
    setApellidos('');
    setDocumentoIdentidad('');
    setCorreoElectronico('');
    setPaisResidencia('Colombia');
    setCiudadResidencia('Bogota');
    setTelefono('3001234567');
    setTipoPersona('NATURAL');
    setArchivosAdjuntos({});
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-sans text-lg font-semibold text-text-primary">Estado de tu solicitud</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Flujo: crear solicitud &rarr; validacion automatica &rarr; si DEVUELTA puedes corregir y revalidar &rarr;
              activacion con pago (solo APROBADA) &rarr; publicar productos (solo ACTIVA).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {solicitudId ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => refreshSolicitud(solicitudId)}
                className="rounded-xl border border-border-strong px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand disabled:opacity-50"
              >
                Actualizar estado
              </button>
            ) : null}
            {estado === 'ACTIVA' && solicitudId ? (
              <button
                type="button"
                disabled={loading || syncRolLoading}
                onClick={() => handleSincronizarRolSesion()}
                className="rounded-xl border border-green-600/40 bg-green-50 px-4 py-2 text-sm font-semibold text-green-900 transition hover:bg-green-100 disabled:opacity-50"
              >
                {syncRolLoading ? 'Sincronizando rol…' : 'Actualizar rol VENDEDOR en sesión'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleNuevaSolicitud}
              className="rounded-xl border border-border-strong px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-danger hover:text-danger"
            >
              Nueva solicitud
            </button>
          </div>
        </div>

        {estado ? (
          <div
            className={`mt-4 inline-flex rounded-full border px-4 py-1.5 text-sm font-semibold ${badgeClass(estado)} ${
              esDevuelta ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-surface' : ''
            }`}
          >
            {estado}
            {solicitudId
              ? ` · ID ${solicitudId}${solicitud?.numeroRadicado ? ` · Rad. ${solicitud.numeroRadicado}` : ''}`
              : ''}
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-muted">Sin solicitud en esta sesion. Completa el formulario inferior.</p>
        )}

        {syncRolMsg ? (
          <p className="mt-3 rounded-lg border border-green-400/50 bg-green-50/80 px-3 py-2 text-xs text-green-900">{syncRolMsg}</p>
        ) : null}

        {solicitudId && solicitud ? (
          <p className="mt-3 text-xs leading-relaxed text-text-secondary">
            <span className="font-medium text-text-primary">Resumen:</span>{' '}
            {[solicitud.nombres, solicitud.apellidos].filter(Boolean).join(' ') || solicitud.nombreVendedor || '—'}
            {solicitud.correoElectronico ? ` · ${solicitud.correoElectronico}` : ''}
            {solicitud.tipoPersona ? ` · ${solicitud.tipoPersona}` : ''}
            {Array.isArray(solicitud.adjuntos) && solicitud.adjuntos.length > 0
              ? ` · ${solicitud.adjuntos.length} adjuntos`
              : ''}
          </p>
        ) : null}

        {esDevuelta ? (
          <div
            className="mt-4 rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm"
            role="status"
          >
            <p className="font-semibold text-amber-950">Solicitud devuelta</p>
            <p className="mt-1 leading-relaxed">
              Tu solicitud fue devuelta. Debes corregir la información y volver a validarla. Ajusta documento y/o
              indicador (score) y pulsa «Reintentar validación». El pago y los productos siguen bloqueados hasta que la
              solicitud quede APROBADA y luego ACTIVA.
            </p>
          </div>
        ) : null}

        {tiendaActivaMsg && estado === 'ACTIVA' ? (
          <div className="mt-4 rounded-xl border border-green-400 bg-green-50 px-4 py-3 text-sm text-green-900">
            <p className="font-medium">Tu tienda ya está activa.</p>
            <p className="mt-2 leading-relaxed">
              Si iniciaste sesión como comprador registrado, tu cuenta se ha actualizado con el rol de vendedor al coincidir el{' '}
              <strong>documento</strong> o el <strong>correo</strong> de la solicitud con tu registro. Hemos intentado renovar tu sesión
              automáticamente; si el menú no muestra aún el modo vendedor, cierra sesión y vuelve a entrar.
            </p>
            <p className="mt-2 text-xs text-green-950/80">
              Caso estudio: registro único como comprador → flujo solicitud + validación + pago → estado ACTIVA y publicación de productos.
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
            {error}
          </div>
        ) : null}
      </div>

      {!solicitudId || onboardingBloqueado ? (
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h3 className="font-sans text-base font-semibold text-text-primary">1. Crear solicitud</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Solicitud de vendedor: datos del interesado (1–7) y documentos requeridos (8). Estado inicial PENDIENTE. Los
            archivos del punto 8 se envían en Base64 al servicio de solicitudes (máximo {Math.round(MAX_BYTES_ADJUNTO / (1024 * 1024))}{' '}
            MB por archivo, PDF o imagen).
          </p>
          <div className="mt-5 rounded-xl border border-brand/25 bg-brand-soft/40 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Plantillas de los puntos 4 y 5 del anexo</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Descargue o abra cada formato desde esta misma página; imprima o guarde como PDF (Ctrl+P), fírmelo y súbalo
              en el punto 8 junto con el resto de documentos.
            </p>
            <ul className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {FORMATOS_LEGALES_VENDEDOR.map((f) => (
                <li key={f.href} className="flex-1 sm:min-w-[220px]">
                  <a
                    href={f.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full flex-col rounded-xl border border-border-strong bg-surface px-4 py-3 text-sm shadow-sm transition hover:border-brand"
                  >
                    <span className="font-semibold text-brand">{f.label}</span>
                    <span className="mt-1 text-xs text-text-muted">{f.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <form onSubmit={handleCrearSolicitud} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-text-primary">1. Nombres</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  required
                  minLength={1}
                  maxLength={120}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">2. Apellidos</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required
                  minLength={1}
                  maxLength={120}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-text-primary">Tipo de persona</label>
                <select
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={tipoPersona}
                  onChange={(e) => setTipoPersona(e.target.value)}
                >
                  <option value="NATURAL">Natural (cédula y anexos de persona natural)</option>
                  <option value="JURIDICA">Jurídica (RUT, cámara de comercio y anexos)</option>
                </select>
                <p className="mt-1 text-xs text-text-muted">
                  El tipo define qué documentos se validan en el servidor; el listado del punto 8 cambia automáticamente.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">3. Número de identificación (cédula o NIT)</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={documentoIdentidad}
                  onChange={(e) => setDocumentoIdentidad(e.target.value)}
                  required
                  minLength={5}
                  maxLength={40}
                  autoComplete="off"
                  inputMode="text"
                  title="Tras quitar guiones y espacios: 5 a 32 letras o números."
                  placeholder={tipoPersona === 'JURIDICA' ? 'Ej. 900123456-7 (NIT)' : 'Ej. 1234567890 (cédula)'}
                />
                <p className="mt-1 text-xs text-text-muted">
                  {tipoPersona === 'JURIDICA'
                    ? 'NIT: puede incluir guiones; se normalizan al enviar. Resultado: 5–32 caracteres alfanuméricos. Evite JUD y documentos que terminen en 999 (simulación).'
                    : 'Cédula: 5–32 caracteres alfanuméricos sin espacios (puede escribir con separadores y se normalizan). Evite JUD y documentos que terminen en 999 (simulación).'}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">4. Correo electrónico</label>
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={correoElectronico}
                onChange={(e) => setCorreoElectronico(e.target.value)}
                required
                maxLength={320}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-text-primary">5. País de residencia</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={paisResidencia}
                  onChange={(e) => setPaisResidencia(e.target.value)}
                  required
                  maxLength={120}
                  autoComplete="country-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">6. Ciudad de residencia</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={ciudadResidencia}
                  onChange={(e) => setCiudadResidencia(e.target.value)}
                  required
                  maxLength={120}
                  autoComplete="address-level2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">7. Teléfono</label>
              <input
                className="mt-2 w-full max-w-md rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                maxLength={40}
                autoComplete="tel"
                placeholder="3001234567"
                title="7 a 40 caracteres: dígitos, espacios, +, () y guiones."
              />
            </div>
            <div className="rounded-xl border border-border-strong bg-page/80 px-4 py-4">
              <p className="text-sm font-semibold text-text-primary">8. Documentos adjuntos (obligatorio)</p>
              <p className="mt-1 text-xs text-text-muted">
                Seleccione un archivo por cada requisito. Tipos admitidos: PDF, JPEG, PNG o WebP. Las filas con plantilla
                enlazan al mismo formato descargable de arriba.
              </p>
              <ol className="mt-4 list-decimal space-y-4 pl-5 text-sm text-text-secondary">
                {(tipoPersona === 'JURIDICA' ? DEF_ADJUNTOS_JURIDICA : DEF_ADJUNTOS_NATURAL).map((row) => {
                  const sel = archivosAdjuntos[row.tipo];
                  const inputId = `adjunto-${tipoPersona}-${row.tipo}`;
                  return (
                    <li key={row.tipo} className="pl-1">
                      <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface/90 p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-text-primary">{row.label}</span>
                          {row.plantillaHref ? (
                            <p className="mt-1 text-xs text-text-muted">
                              <a
                                href={row.plantillaHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-brand underline-offset-2 hover:underline"
                              >
                                Abrir plantilla
                              </a>
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 flex-col gap-1 sm:items-end">
                          <label
                            htmlFor={inputId}
                            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-border-strong bg-page px-3 py-2 text-xs font-semibold text-text-primary transition hover:border-brand"
                          >
                            Elegir archivo
                          </label>
                          <input
                            id={inputId}
                            type="file"
                            accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
                            className="sr-only"
                            onChange={(ev) => {
                              const f = ev.target.files?.[0] ?? null;
                              setArchivosAdjuntos((prev) => ({ ...prev, [row.tipo]: f }));
                            }}
                          />
                          <span className="max-w-[220px] truncate text-right text-xs text-text-muted" title={sel?.name}>
                            {sel instanceof File ? sel.name : 'Ningún archivo'}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Nombre comercial / tienda (opcional)</label>
              <input
                className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={nombreVendedor}
                onChange={(e) => setNombreVendedor(e.target.value)}
                maxLength={200}
                placeholder="Si lo dejas vacío se usa nombres + apellidos"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/90 disabled:opacity-50"
            >
              Enviar solicitud
            </button>
          </form>
        </section>
      ) : null}

      {solicitudId && puedeRevalidar ? (
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h3 className="font-sans text-base font-semibold text-text-primary">
            {esDevuelta ? '2. Reintentar validación' : '2. Validacion automatica'}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            {esDevuelta
              ? 'Mismo número de solicitud: puedes editar documento y score y volver a enviar. Podrás repetir este paso las veces que necesites.'
              : 'Llama al motor de validacion (Datacrédito/CIFIN/judicial simulados). Umbrales típicos: indicador &lt;550 rechazo, 550–649 devolución, ≥650 con línea NORMAL suele permitir aprobación si Datacrédito y judicial lo permiten.'}
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <label className="text-sm font-medium text-text-primary">Documento (debe coincidir con la solicitud)</label>
              <input
                className="mt-2 w-full min-w-[220px] rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={documentoIdentidad}
                onChange={(e) => setDocumentoIdentidad(e.target.value)}
                maxLength={40}
                title="Debe coincidir con el documento de la solicitud (misma normalización)."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Indicador simulado (CIFIN)</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                className="mt-2 w-36 rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={scoreValidacion}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setScoreValidacion(raw);
                }}
              />
              <p className="mt-1 text-xs text-text-muted">Entero entre 0 y 9999.</p>
            </div>
            <button
              type="button"
              disabled={loading || solicitudId == null}
              onClick={() => void handleValidarSolicitud()}
              className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:opacity-50"
            >
              {loading ? 'Validando...' : esDevuelta ? 'Reintentar validación' : 'Ejecutar validacion'}
            </button>
          </div>
          {validacionOk ? (
            <p className="mt-3 text-sm font-medium text-success" role="status">
              {validacionOk}
            </p>
          ) : null}
        </section>
      ) : null}

      {solicitudId && puedeActivar ? (
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <h3 className="font-sans text-base font-semibold text-text-primary">3. Activar vendedor (pago)</h3>
          <p className="mt-1 text-sm text-text-secondary">Solo en estado APROBADA. Integra con payment-service.</p>
          <form onSubmit={handleActivar} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary">Plan de suscripción</label>
              <select
                className="mt-2 w-full max-w-xs rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={periodoSuscripcionPlan}
                onChange={(e) => setPeriodoSuscripcionPlan(e.target.value)}
              >
                <option value="MENSUAL">Mensual</option>
                <option value="SEMESTRAL">Semestral</option>
                <option value="ANUAL">Anual</option>
              </select>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-text-primary">Tipo de pago</legend>
              <label className="mr-6 inline-flex items-center gap-2 text-sm">
                <input type="radio" name="tipoAct" checked={tipoActivacion === 'ONLINE'} onChange={() => setTipoActivacion('ONLINE')} />
                ONLINE
              </label>
              <label className="mr-6 inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="tipoAct"
                  checked={tipoActivacion === 'TARJETA'}
                  onChange={() => setTipoActivacion('TARJETA')}
                />
                TARJETA
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="tipoAct"
                  checked={tipoActivacion === 'CONSIGNACION'}
                  onChange={() => setTipoActivacion('CONSIGNACION')}
                />
                CONSIGNACION
              </label>
            </fieldset>
            <div>
              <label className="text-sm font-medium text-text-primary">Monto</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="mt-2 w-full max-w-xs rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={montoActivacion}
                onChange={(e) => setMontoActivacion(e.target.value)}
                required
              />
            </div>
            {tipoActivacion === 'ONLINE' ? (
              <div>
                <label className="text-sm font-medium text-text-primary">tokenPasarela</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 font-mono text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={tokenPasarela}
                  onChange={(e) => setTokenPasarela(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-text-muted">Use tok_simular_rechazo solo para probar rechazo declinado.</p>
              </div>
            ) : tipoActivacion === 'TARJETA' ? (
              <div>
                <label className="text-sm font-medium text-text-primary">Últimos 4 dígitos tarjeta</label>
                <input
                  className="mt-2 w-full max-w-[12rem] rounded-xl border border-border-strong bg-page px-4 py-3 font-mono text-sm tracking-widest focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={ultimosDigitosTarjetaActivacion}
                  onChange={(e) => setUltimosDigitosTarjetaActivacion(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                  required
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-text-primary">Numero comprobante consignacion</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 font-mono text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={numeroComprobante}
                  onChange={(e) => setNumeroComprobante(e.target.value)}
                  placeholder="Opcional: se genera si vacio"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-success px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
            >
              Activar tienda
            </button>
          </form>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h3 className="font-sans text-base font-semibold text-text-primary">4. Publicar producto</h3>
        {!puedePublicar ? (
          <p
            className={`mt-2 rounded-xl border px-4 py-3 text-sm ${
              esDevuelta
                ? 'border-amber-400 bg-amber-50 text-amber-950'
                : estado === 'APROBADA'
                  ? 'border-amber-300 bg-amber-50 text-amber-950'
                  : 'border-border-strong bg-surface-muted text-text-secondary'
            }`}
            role="note"
          >
            {esDevuelta
              ? 'No puedes crear productos con la solicitud en DEVUELTA. Revalida hasta obtener APROBADA, activa la tienda con el pago y al quedar ACTIVA podrás publicar.'
              : estado === 'APROBADA'
                ? 'La solicitud está APROBADA pero aún no ACTIVA: completa el pago en la sección 3. Solo con estado ACTIVA puedes crear productos.'
                : estado === 'PENDIENTE'
                  ? 'Completa primero la validación automática y el flujo hasta ACTIVA para poder publicar productos.'
                  : 'Debes activar tu cuenta de vendedor (estado ACTIVA tras el pago) antes de crear productos.'}
          </p>
        ) : (
          <form onSubmit={handleCrearProducto} className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary">Nombre</label>
              <input
                className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={nombreProducto}
                onChange={(e) => setNombreProducto(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Precio</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="mt-2 w-full max-w-xs rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={precioProducto}
                onChange={(e) => setPrecioProducto(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Descripcion</label>
              <textarea
                className="mt-2 min-h-[88px] w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={descripcionProducto}
                onChange={(e) => setDescripcionProducto(e.target.value)}
                required
                maxLength={500}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Categorias (coma)</label>
              <input
                className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={categoriasProducto}
                onChange={(e) => setCategoriasProducto(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-text-primary">Marca</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm"
                  value={marcaProducto}
                  onChange={(e) => setMarcaProducto(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Subcategoría</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm"
                  value={subcategoriaProducto}
                  onChange={(e) => setSubcategoriaProducto(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Original / Genérico</label>
                <select
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm"
                  value={originalidadProducto}
                  onChange={(e) => setOriginalidadProducto(e.target.value)}
                >
                  <option value="">—</option>
                  <option value="ORIGINAL">Original</option>
                  <option value="GENERICO">Genérico</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Nuevo / Usado</label>
                <select
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm"
                  value={condicionProducto}
                  onChange={(e) => setCondicionProducto(e.target.value)}
                >
                  <option value="NUEVO">Nuevo</option>
                  <option value="USADO">Usado</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Cantidad stock</label>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm"
                  value={cantidadStockProducto}
                  onChange={(e) => setCantidadStockProducto(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Peso (gramos)</label>
                <input
                  type="number"
                  min={0}
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm"
                  value={pesoGramosProducto}
                  onChange={(e) => setPesoGramosProducto(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Color</label>
                <input className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm" value={colorProducto} onChange={(e) => setColorProducto(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Tamaño</label>
                <input className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm" value={tamanoProducto} onChange={(e) => setTamanoProducto(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-text-primary">Talla</label>
                <input className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm" value={tallaProducto} onChange={(e) => setTallaProducto(e.target.value)} />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <div>
                  <label className="text-sm font-medium text-text-primary">Imágenes del producto</label>
                  <p className="mt-1 text-xs text-text-muted">
                    Sube varias fotos (distintos frentes) desde tu equipo o pega URLs públicas; puedes combinar ambas
                    (máx. {MAX_IMAGENES_PRODUCTO} en total). En producción conviene un CDN en lugar de data URLs.
                  </p>
                </div>
                <input
                  ref={inputImagenesProductoRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    void handleAgregarImagenesProducto(e.target.files);
                    e.target.value = '';
                  }}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={loading || subiendoImagenes}
                    onClick={() => inputImagenesProductoRef.current?.click()}
                    className="rounded-xl border border-border-strong bg-page px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:border-brand disabled:opacity-50"
                  >
                    {subiendoImagenes ? 'Procesando imágenes…' : 'Elegir imágenes del equipo'}
                  </button>
                  <span className="text-xs text-text-muted">PNG, JPEG, GIF o WebP · hasta 8 MB c/u</span>
                </div>
                {imagenesArchivoItems.length > 0 ? (
                  <ul className="flex flex-wrap gap-3" aria-label="Imágenes seleccionadas">
                    {imagenesArchivoItems.map((im) => (
                      <li key={im.id} className="group relative">
                        <img
                          src={im.dataUrl}
                          alt=""
                          className="h-24 w-24 rounded-xl border border-border object-cover shadow-sm"
                        />
                        <button
                          type="button"
                          aria-label={`Quitar ${im.nombre}`}
                          onClick={() => quitarImagenArchivoProducto(im.id)}
                          className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border border-border-strong bg-surface text-sm font-bold text-text-primary shadow transition hover:bg-danger hover:text-white"
                        >
                          ×
                        </button>
                        <p className="mt-1 max-w-[6.5rem] truncate text-[10px] text-text-muted" title={im.nombre}>
                          {im.nombre}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div>
                  <label htmlFor="seller-producto-imagenes-urls" className="text-xs font-medium text-text-muted">
                    O URLs públicas (separadas por coma)
                  </label>
                  <textarea
                    id="seller-producto-imagenes-urls"
                    className="mt-1 min-h-[72px] w-full rounded-xl border border-border-strong bg-page px-4 py-3 font-mono text-xs focus:border-brand focus:ring-2 focus:ring-brand/25"
                    value={imagenesUrlsProducto}
                    onChange={(e) => setImagenesUrlsProducto(e.target.value)}
                    placeholder="Una URL por línea, o varias https://… separadas por coma"
                    maxLength={12000}
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/90 disabled:opacity-50"
            >
              Publicar producto
            </button>
            {productoOk ? <p className="text-sm font-medium text-success">{productoOk}</p> : null}
          </form>
        )}
      </section>

      {loading ? (
        <p className="text-center text-sm text-text-muted" aria-live="polite">
          Cargando...
        </p>
      ) : null}
    </div>
  );
}
