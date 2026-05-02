import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSolicitud, getSolicitudes, renovarSuscripcion, validarSolicitud } from '../services/sellerService.js';
import { getRequestErrorMessage } from '../utils/apiError.js';

const ESTADOS = [
  '',
  'PENDIENTE',
  'DEVUELTA',
  'APROBADA',
  'RECHAZADA',
  'ACTIVA',
  'EN_MORA',
  'CANCELADA',
];

function fmtInstant(iso) {
  if (iso == null || iso === '') return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

export function PanelDirector() {
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documentoIdentidad, setDocumentoIdentidad] = useState('');
  const [estado, setEstado] = useState('');
  const [q, setQ] = useState('');
  const [creadoDesde, setCreadoDesde] = useState('');
  const [creadoHasta, setCreadoHasta] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [detalleCargando, setDetalleCargando] = useState(false);
  const [renovando, setRenovando] = useState(false);
  const [renovacionOk, setRenovacionOk] = useState('');
  const [tipoRenovacion, setTipoRenovacion] = useState('ONLINE');
  const [montoRenovacion, setMontoRenovacion] = useState('99.9');
  const [tokenRenovacion, setTokenRenovacion] = useState('tok_demo_ok');
  const [numeroComprobanteRenovacion, setNumeroComprobanteRenovacion] = useState('');
  const [periodoRenovacionPlan, setPeriodoRenovacionPlan] = useState('MENSUAL');
  const [ultimosDigitosTarjetaRenovacion, setUltimosDigitosTarjetaRenovacion] = useState('4242');
  const [solicitudIdFiltro, setSolicitudIdFiltro] = useState('');

  const [cifinLineas, setCifinLineas] = useState('');
  const [valDoc, setValDoc] = useState('');
  const [valScore, setValScore] = useState('500');
  const [exigenciaJudicial, setExigenciaJudicial] = useState('');
  const [validacionEjecutando, setValidacionEjecutando] = useState(false);
  const [validacionMsg, setValidacionMsg] = useState('');
  const [validacionErr, setValidacionErr] = useState('');

  async function ejecutarBusqueda() {
    setError('');
    setLoading(true);
    try {
      const sid = solicitudIdFiltro.trim();
      const filtros = {
        solicitudId: sid && /^\d+$/.test(sid) ? sid : undefined,
        documentoIdentidad: documentoIdentidad.trim() || undefined,
        estado: estado || undefined,
        q: q.trim() || undefined,
        creadoDesde: creadoDesde
          ? new Date(creadoDesde).toISOString()
          : undefined,
        creadoHasta: creadoHasta ? new Date(creadoHasta).toISOString() : undefined,
      };
      const data = await getSolicitudes(filtros);
      setFilas(data);
    } catch (err) {
      setFilas([]);
      setError(getRequestErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void ejecutarBusqueda();
    // Carga inicial sin depender de filtros (evita bucles y peticiones por tecla).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo mount
  }, []);

  async function abrirDetalle(id) {
    setDetalle(null);
    setRenovacionOk('');
    setValidacionMsg('');
    setValidacionErr('');
    setCifinLineas('');
    setDetalleCargando(true);
    setError('');
    try {
      const s = await getSolicitud(id);
      setDetalle(s);
      const doc = String(s.documentoIdentidad ?? '').trim();
      setValDoc(doc);
      setValScore('500');
      setExigenciaJudicial('');
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setDetalleCargando(false);
    }
  }

  function cerrarDetalle() {
    setDetalle(null);
    setRenovacionOk('');
  }

  const puedeRenovarSuscripcion =
    detalle != null && (detalle.estado === 'ACTIVA' || detalle.estado === 'EN_MORA');

  const puedeEjecutarValidacionIntegrada =
    detalle != null && (detalle.estado === 'PENDIENTE' || detalle.estado === 'DEVUELTA');

  async function handleValidacionIntegrada(e) {
    e.preventDefault();
    if (!detalle?.id || !puedeEjecutarValidacionIntegrada) return;
    setValidacionErr('');
    setValidacionMsg('');
    setValidacionEjecutando(true);
    try {
      const payload = { exigenciaJudicial: exigenciaJudicial.trim() || undefined };
      const cifin = cifinLineas.trim();
      if (cifin) {
        payload.contenidoArchivoCifin = cifin;
      } else {
        payload.documento = valDoc.trim();
        payload.score = Number(valScore);
      }
      const actualizada = await validarSolicitud(detalle.id, payload);
      setDetalle(actualizada);
      setValidacionMsg(`Estado tras validación: ${actualizada.estado}`);
      await ejecutarBusqueda();
    } catch (err) {
      setValidacionErr(getRequestErrorMessage(err));
    } finally {
      setValidacionEjecutando(false);
    }
  }

  async function handleRenovarSuscripcion(e) {
    e.preventDefault();
    if (!detalle?.id || !puedeRenovarSuscripcion) return;
    setError('');
    setRenovacionOk('');
    const monto = Number(montoRenovacion);
    if (!Number.isFinite(monto) || monto < 0.01) {
      setError('El monto de renovación debe ser un número ≥ 0.01.');
      return;
    }
    let body;
    if (tipoRenovacion === 'ONLINE') {
      const tok = String(tokenRenovacion ?? '').trim();
      if (!tok) {
        setError('tokenPasarela es obligatorio para renovación ONLINE.');
        return;
      }
      body = { tipo: 'ONLINE', monto, tokenPasarela: tok, periodoSuscripcion: periodoRenovacionPlan };
    } else if (tipoRenovacion === 'TARJETA') {
      const dig = String(ultimosDigitosTarjetaRenovacion ?? '').trim();
      if (!/^\d{4}$/.test(dig)) {
        setError('Ultimos digitos de tarjeta: exactamente 4 dígitos.');
        return;
      }
      body = { tipo: 'TARJETA', monto, ultimosDigitosTarjeta: dig, periodoSuscripcion: periodoRenovacionPlan };
    } else {
      const comp =
        String(numeroComprobanteRenovacion ?? '').trim() ||
        `WEB-REN-${detalle.id}-${Date.now()}`;
      body = {
        tipo: 'CONSIGNACION',
        monto,
        numeroComprobanteConsignacion: comp,
        periodoSuscripcion: periodoRenovacionPlan,
      };
    }
    setRenovando(true);
    try {
      const actualizada = await renovarSuscripcion(detalle.id, body);
      setDetalle(actualizada);
      setRenovacionOk('Suscripción renovada correctamente.');
      await ejecutarBusqueda();
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setRenovando(false);
    }
  }

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Director</p>
        <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          Solicitudes de vendedor
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Bandeja HU-04: filtros por ID, estado y fechas. Validación HU-05–HU-08 simulada vía CIFIN (texto) y exigencia judicial
          (HU-07). Suscripción con planes mensual, semestral y anual.{' '}
          <Link to="/director/bam" className="font-semibold text-brand hover:underline">
            Tablero BAM (KPIs)
          </Link>
          {' · '}
          <Link to="/director/admin" className="font-semibold text-brand hover:underline">
            Parámetros (admin)
          </Link>
          . Adjuntos solo en detalle.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="font-sans text-base font-semibold text-text-primary">Filtros</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-text-primary">ID solicitud (exacto)</label>
            <input
              className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-2 text-sm tabular-nums"
              value={solicitudIdFiltro}
              onChange={(e) => setSolicitudIdFiltro(e.target.value.replace(/\D/g, ''))}
              placeholder="Ej. 42"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Documento (contiene)</label>
            <input
              className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-2 text-sm"
              value={documentoIdentidad}
              onChange={(e) => setDocumentoIdentidad(e.target.value)}
              placeholder="Ej. CC1023"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Estado</label>
            <select
              className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-2 text-sm"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              {ESTADOS.map((x) => (
                <option key={x || 'todos'} value={x}>
                  {x || 'Todos'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Texto (nombre, correo, nombres, apellidos)</label>
            <input
              className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-2 text-sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Búsqueda libre"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Creado desde</label>
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-2 text-sm"
              value={creadoDesde}
              onChange={(e) => setCreadoDesde(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Creado hasta</label>
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-2 text-sm"
              value={creadoHasta}
              onChange={(e) => setCreadoHasta(e.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void ejecutarBusqueda()}
          className="mt-6 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-50"
        >
          {loading ? 'Cargando…' : 'Actualizar'}
        </button>
      </section>

      {error ? (
        <div className="mt-6 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </div>
      ) : null}

      <section className="mt-8 overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
        <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-page">
              <th className="px-4 py-3 font-semibold text-text-primary">Identificación</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Apellidos</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Nombres</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Correo</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Estado</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Vencimiento suscripción</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Radicado</th>
              <th className="px-4 py-3 font-semibold text-text-primary">ID</th>
              <th className="px-4 py-3 font-semibold text-text-primary"> </th>
            </tr>
          </thead>
          <tbody>
            {filas.length === 0 && !loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-text-muted">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              filas.map((row) => (
                <tr key={row.id} className="border-b border-border hover:bg-page/80">
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{row.documentoIdentidad}</td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-text-primary">{row.apellidos ?? '—'}</td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-text-primary">{row.nombres ?? '—'}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-text-secondary">{row.correoElectronico ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border-strong px-2 py-0.5 text-xs font-semibold">
                      {row.estado}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-text-muted">
                    {fmtInstant(row.proximoVencimientoSuscripcion)}
                  </td>
                  <td className="max-w-[120px] truncate px-4 py-3 font-mono text-xs text-text-muted">
                    {row.numeroRadicado ?? '—'}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-text-muted">{row.id}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-sm font-semibold text-brand hover:underline"
                      onClick={() => void abrirDetalle(row.id)}
                    >
                      Detalle
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {detalle || detalleCargando ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detalle-titulo"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <h2 id="detalle-titulo" className="font-sans text-lg font-semibold text-text-primary">
                Detalle solicitud
              </h2>
              <button
                type="button"
                onClick={cerrarDetalle}
                className="rounded-lg border border-border px-2 py-1 text-sm text-text-secondary hover:bg-page"
              >
                Cerrar
              </button>
            </div>
            {detalleCargando ? (
              <p className="mt-4 text-sm text-text-muted">Cargando…</p>
            ) : detalle ? (
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-text-muted">ID</dt>
                  <dd className="text-text-primary">{detalle.id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-muted">Número de radicado</dt>
                  <dd className="font-mono text-sm text-text-primary">{detalle.numeroRadicado ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-muted">Estado</dt>
                  <dd className="text-text-primary">{detalle.estado}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-muted">Nombre mostrado</dt>
                  <dd className="text-text-primary">{detalle.nombreVendedor}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-muted">Nombres / apellidos</dt>
                  <dd className="text-text-primary">
                    {[detalle.nombres, detalle.apellidos].filter(Boolean).join(' ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-text-muted">Documento</dt>
                  <dd className="font-mono text-text-primary">{detalle.documentoIdentidad}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-muted">Correo</dt>
                  <dd className="text-text-primary">{detalle.correoElectronico ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-muted">Ubicación</dt>
                  <dd className="text-text-primary">
                    {[detalle.paisResidencia, detalle.ciudadResidencia].filter(Boolean).join(', ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-text-muted">Teléfono</dt>
                  <dd className="text-text-primary">{detalle.telefono ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-muted">Tipo persona</dt>
                  <dd className="text-text-primary">{detalle.tipoPersona ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-muted">Vencimiento suscripción</dt>
                  <dd className="text-text-primary">{fmtInstant(detalle.proximoVencimientoSuscripcion)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-muted">Adjuntos</dt>
                  <dd>
                    {Array.isArray(detalle.adjuntos) && detalle.adjuntos.length > 0 ? (
                      <ul className="mt-1 list-inside list-disc space-y-1 text-text-secondary">
                        {detalle.adjuntos.map((a, i) => (
                          <li key={i}>
                            {a.tipo}: {a.nombreArchivo}
                            {a.uriArchivo ? ` · ${a.uriArchivo}` : ''}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </dd>
                </div>
              </dl>
            ) : null}
            {!detalleCargando && detalle && puedeEjecutarValidacionIntegrada ? (
              <form onSubmit={handleValidacionIntegrada} className="mt-6 border-t border-border pt-4">
                <h3 className="font-sans text-sm font-semibold text-text-primary">
                  Validación automática (CIFIN / Datacrédito)
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  HU-06: pegue líneas de archivo plano (ej. <span className="font-mono">DOC|500|NORMAL</span>) o use documento +
                  score. HU-07: indique exigencia judicial para sobrescribir el mock.
                </p>
                {validacionErr ? (
                  <p className="mt-2 text-sm text-danger" role="alert">
                    {validacionErr}
                  </p>
                ) : null}
                {validacionMsg ? (
                  <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400" role="status">
                    {validacionMsg}
                  </p>
                ) : null}
                <div className="mt-3">
                  <label className="text-xs font-medium text-text-muted">Contenido archivo CIFIN (opcional)</label>
                  <textarea
                    className="mt-1 w-full rounded-xl border border-border-strong bg-page px-3 py-2 font-mono text-xs"
                    rows={4}
                    value={cifinLineas}
                    onChange={(e) => setCifinLineas(e.target.value)}
                    placeholder="CC123|500|NORMAL"
                  />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-text-muted">Documento (si CIFIN vacío)</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-border-strong bg-page px-3 py-2 font-mono text-sm"
                      value={valDoc}
                      onChange={(e) => setValDoc(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-text-muted">Score simulado</label>
                    <input
                      type="number"
                      min={0}
                      max={9999}
                      className="mt-1 w-full rounded-xl border border-border-strong bg-page px-3 py-2 text-sm tabular-nums"
                      value={valScore}
                      onChange={(e) => setValScore(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-text-muted">Exigencia judicial (Director)</label>
                    <select
                      className="mt-1 w-full max-w-xs rounded-xl border border-border-strong bg-page px-3 py-2 text-sm"
                      value={exigenciaJudicial}
                      onChange={(e) => setExigenciaJudicial(e.target.value)}
                    >
                      <option value="">(Usar mock por documento)</option>
                      <option value="NO_REQUERIDO">No requerido</option>
                      <option value="REQUERIDO">Requerido</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={validacionEjecutando}
                  className="mt-4 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-50"
                >
                  {validacionEjecutando ? 'Ejecutando…' : 'Ejecutar validación'}
                </button>
              </form>
            ) : null}
            {!detalleCargando && detalle && puedeRenovarSuscripcion ? (
              <form onSubmit={handleRenovarSuscripcion} className="mt-6 border-t border-border pt-4">
                <h3 className="font-sans text-sm font-semibold text-text-primary">Renovar suscripción (demo)</h3>
                <p className="mt-1 text-xs text-text-muted">
                  Solo estados ACTIVA y EN_MORA. Mismo contrato que la activación del vendedor (payment-service). Para
                  rechazo en ONLINE use el token de simulación que indique el backend.
                </p>
                <div className="mt-3">
                  <label className="text-xs font-medium text-text-muted">Plan de suscripción (HU-11)</label>
                  <select
                    className="mt-1 w-full max-w-xs rounded-xl border border-border-strong bg-page px-3 py-2 text-sm"
                    value={periodoRenovacionPlan}
                    onChange={(e) => setPeriodoRenovacionPlan(e.target.value)}
                  >
                    <option value="MENSUAL">Mensual</option>
                    <option value="SEMESTRAL">Semestral</option>
                    <option value="ANUAL">Anual</option>
                  </select>
                </div>
                <fieldset className="mt-3 space-y-2">
                  <legend className="text-xs font-medium text-text-muted">Tipo de pago</legend>
                  <label className="mr-4 inline-flex items-center gap-2 text-sm text-text-primary">
                    <input
                      type="radio"
                      name="tipoRenovacion"
                      checked={tipoRenovacion === 'ONLINE'}
                      onChange={() => setTipoRenovacion('ONLINE')}
                    />
                    ONLINE
                  </label>
                  <label className="mr-4 inline-flex items-center gap-2 text-sm text-text-primary">
                    <input
                      type="radio"
                      name="tipoRenovacion"
                      checked={tipoRenovacion === 'TARJETA'}
                      onChange={() => setTipoRenovacion('TARJETA')}
                    />
                    TARJETA
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-text-primary">
                    <input
                      type="radio"
                      name="tipoRenovacion"
                      checked={tipoRenovacion === 'CONSIGNACION'}
                      onChange={() => setTipoRenovacion('CONSIGNACION')}
                    />
                    CONSIGNACION
                  </label>
                </fieldset>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-text-muted">Monto</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="mt-1 w-full max-w-xs rounded-xl border border-border-strong bg-page px-3 py-2 text-sm"
                      value={montoRenovacion}
                      onChange={(e) => setMontoRenovacion(e.target.value)}
                      required
                    />
                  </div>
                  {tipoRenovacion === 'ONLINE' ? (
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-text-muted">tokenPasarela</label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-border-strong bg-page px-3 py-2 font-mono text-xs"
                        value={tokenRenovacion}
                        onChange={(e) => setTokenRenovacion(e.target.value)}
                        autoComplete="off"
                        required
                      />
                      <p className="mt-1 text-[11px] text-text-muted">
                        Ej. tok_demo_ok; para prueba de rechazo según contrato del payment-service.
                      </p>
                    </div>
                  ) : tipoRenovacion === 'TARJETA' ? (
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-text-muted">Últimos 4 dígitos tarjeta</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        className="mt-1 w-full max-w-[10rem] rounded-xl border border-border-strong bg-page px-3 py-2 font-mono text-sm tracking-widest"
                        value={ultimosDigitosTarjetaRenovacion}
                        onChange={(e) => setUltimosDigitosTarjetaRenovacion(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        required
                      />
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-text-muted">Número comprobante consignación</label>
                      <input
                        type="text"
                        className="mt-1 w-full rounded-xl border border-border-strong bg-page px-3 py-2 font-mono text-sm"
                        value={numeroComprobanteRenovacion}
                        onChange={(e) => setNumeroComprobanteRenovacion(e.target.value)}
                        placeholder="Opcional: se genera si está vacío"
                        autoComplete="off"
                      />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={renovando}
                  className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50"
                >
                  {renovando ? 'Procesando pago…' : 'Registrar renovación'}
                </button>
                {renovacionOk ? (
                  <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400" role="status">
                    {renovacionOk}
                  </p>
                ) : null}
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
