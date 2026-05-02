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

/** Metadatos de adjuntos exigidos por la cadena de validación (demo: sin Base64). */
const ADJUNTOS_NATURAL = [
  { tipo: 'CEDULA', nombreArchivo: 'cedula.pdf' },
  { tipo: 'ACEPTACION_CENTRALES_RIESGO', nombreArchivo: 'centrales-riesgo.pdf' },
  { tipo: 'ACEPTACION_DATOS_PERSONALES', nombreArchivo: 'datos-personales.pdf' },
];

const ADJUNTOS_JURIDICA = [
  { tipo: 'RUT', nombreArchivo: 'rut.pdf' },
  { tipo: 'CAMARA_COMERCIO', nombreArchivo: 'camara-comercio.pdf' },
  { tipo: 'ACEPTACION_CENTRALES_RIESGO', nombreArchivo: 'centrales-riesgo.pdf' },
  { tipo: 'ACEPTACION_DATOS_PERSONALES', nombreArchivo: 'datos-personales.pdf' },
];

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

  const [scoreValidacion, setScoreValidacion] = useState(500);

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
      const adjuntos = tipoPersona === 'JURIDICA' ? ADJUNTOS_JURIDICA : ADJUNTOS_NATURAL;
      const creada = await createSolicitud({
        ...(nombreMostrar ? { nombreVendedor: nombreMostrar } : {}),
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        documentoIdentidad: documentoIdentidad.trim(),
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
    const documentoInput = String(documentoIdentidad ?? '').trim();
    const scoreInput = Number(scoreValidacion);

    if (solicitudId == null || solicitudId === '') {
      setError('No hay solicitud cargada. Crea una solicitud primero o pulsa Actualizar estado.');
      return;
    }
    if (!documentoInput) {
      setError('El documento es obligatorio y debe coincidir con el de la solicitud.');
      return;
    }
    if (!Number.isFinite(scoreInput)) {
      setError('El indicador (score) debe ser un numero valido.');
      return;
    }

    solicitudFetchSeq.current += 1;

    const payload = {
      documento: documentoInput,
      score: Math.trunc(scoreInput),
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
    solicitudFetchSeq.current += 1;
    setLoading(true);
    try {
      let body;
      const periodoSuscripcion = periodoSuscripcionPlan;
      const monto = Number(montoActivacion);
      if (tipoActivacion === 'ONLINE') {
        body = {
          tipo: 'ONLINE',
          monto,
          tokenPasarela: tokenPasarela.trim(),
          periodoSuscripcion,
        };
      } else if (tipoActivacion === 'TARJETA') {
        const dig = ultimosDigitosTarjetaActivacion.trim();
        if (!/^\d{4}$/.test(dig)) {
          setError('Últimos 4 dígitos de tarjeta obligatorios (4 números).');
          setLoading(false);
          return;
        }
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

  async function handleCrearProducto(e) {
    e.preventDefault();
    if (!solicitudId) return;
    setError('');
    setProductoOk('');
    const categorias = categoriasProducto
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!categorias.length) {
      setError('Indica al menos una categoria (separadas por coma).');
      return;
    }
    setLoading(true);
    try {
      const imagenesUrls = imagenesUrlsProducto
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const stock = Number(cantidadStockProducto);
      const pesoG = pesoGramosProducto.trim() ? Number(pesoGramosProducto) : undefined;
      const payload = {
        vendedorSolicitudId: solicitudId,
        nombre: nombreProducto.trim(),
        precio: Number(precioProducto),
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
    setNombreVendedor('');
    setNombres('');
    setApellidos('');
    setDocumentoIdentidad('');
    setCorreoElectronico('');
    setPaisResidencia('Colombia');
    setCiudadResidencia('Bogota');
    setTelefono('3001234567');
    setTipoPersona('NATURAL');
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
            Registrate como vendedor. Estado inicial: PENDIENTE. Los adjuntos obligatorios se envían con nombres de
            archivo de demo (sin subida real); el backend puede persistir Base64 si lo amplías.
          </p>
          <div className="mt-5 rounded-xl border border-brand/25 bg-brand-soft/40 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">HU-03 · Formatos legales</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Abra cada enlace en una pestaña nueva para imprimir o guardar como PDF. Use estas plantillas como guía al
              preparar sus propios archivos para la validación.
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
            <div>
              <label className="text-sm font-medium text-text-primary">Nombre comercial / tienda (opcional)</label>
              <input
                className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={nombreVendedor}
                onChange={(e) => setNombreVendedor(e.target.value)}
                placeholder="Si lo dejas vacío se usa nombres + apellidos"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-text-primary">Nombres</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  required
                  minLength={1}
                  maxLength={120}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Apellidos</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required
                  minLength={1}
                  maxLength={120}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Correo electrónico</label>
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={correoElectronico}
                onChange={(e) => setCorreoElectronico(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-text-primary">País de residencia</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={paisResidencia}
                  onChange={(e) => setPaisResidencia(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Ciudad de residencia</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={ciudadResidencia}
                  onChange={(e) => setCiudadResidencia(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-text-primary">Teléfono</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  placeholder="3001234567"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Tipo de persona</label>
                <select
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  value={tipoPersona}
                  onChange={(e) => setTipoPersona(e.target.value)}
                >
                  <option value="NATURAL">Natural</option>
                  <option value="JURIDICA">Jurídica</option>
                </select>
                <p className="mt-1 text-xs text-text-muted">
                  Natural: cédula + aceptaciones. Jurídica: RUT + cámara de comercio + aceptaciones.
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Documento de identidad</label>
              <input
                className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={documentoIdentidad}
                onChange={(e) => setDocumentoIdentidad(e.target.value)}
                required
                minLength={5}
                maxLength={32}
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-text-muted">
                Evita la marca JUD en el documento (simulacion judicial). No termines en 999 (lista de control simulada).
              </p>
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
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Indicador simulado (CIFIN)</label>
              <input
                type="number"
                min={0}
                max={9999}
                className="mt-2 w-36 rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={scoreValidacion}
                onChange={(e) => setScoreValidacion(Number(e.target.value))}
              />
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
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-text-primary">URLs imágenes (coma)</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 font-mono text-xs"
                  value={imagenesUrlsProducto}
                  onChange={(e) => setImagenesUrlsProducto(e.target.value)}
                  placeholder="https://..., https://..."
                />
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
