import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isVendedor } from '../auth/roles.js';
import { PRODUCTO_FAQ_ITEMS } from '../data/marketplaceContent.js';
import { useAuth } from '../hooks/useAuth.js';
import { useSellerSolicitudSessionId } from '../hooks/useSellerSolicitudSessionId.js';
import {
  crearInteraccionProducto,
  listInteraccionesProducto,
  responderInteraccionProducto,
} from '../services/productCommunityService.js';
import { getReputacionResumen, postCalificacionVendedor } from '../services/reputacionService.js';
import { getRequestErrorMessage } from '../utils/apiError.js';

function formatInstant(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return String(iso);
  }
}

function ReputacionVisual({ promedio, total }) {
  const stars =
    promedio == null ? 0 : Math.min(5, Math.max(0, Math.round((promedio / 10) * 5)));
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-lg tracking-tight" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < stars ? 'text-amber-500' : 'text-border-strong'}>
            ★
          </span>
        ))}
      </span>
      <span className="text-sm text-text-secondary">
        {promedio != null ? `${Number(promedio).toFixed(1)} / 10` : '—'} · {total} calificación(es)
      </span>
    </div>
  );
}

/** Cinco estrellas en UI → valor 2,4,6,8,10 en API (escala 1–10 del backend). */
function estrellasUiAValorApi(stars1a5) {
  const n = Math.floor(Number(stars1a5));
  if (n < 1 || n > 5) return null;
  return n * 2;
}

function CalificarVendedorForm({
  solicitudId,
  productoId,
  esVendedorDelProducto,
  isAuthenticated,
  onExito,
}) {
  const location = useLocation();
  const [draftStars, setDraftStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const preview = hoverStar || draftStars;

  if (!isAuthenticated) {
    return (
      <div className="mt-5 rounded-xl border border-dashed border-border bg-page/40 px-4 py-3 text-sm text-text-secondary">
        <Link
          to="/login"
          state={{ from: { pathname: location.pathname, search: location.search } }}
          className="font-semibold text-brand underline-offset-2 hover:underline"
        >
          Inicia sesión
        </Link>{' '}
        para dejar una calificación al vendedor.
      </div>
    );
  }

  if (esVendedorDelProducto) {
    return (
      <p className="mt-5 text-sm text-text-muted">
        No puedes calificar tu propia tienda en este producto.
      </p>
    );
  }

  async function enviar(e) {
    e.preventDefault();
    setError('');
    const valor = estrellasUiAValorApi(draftStars);
    if (valor == null) {
      setError('Elige de 1 a 5 estrellas.');
      return;
    }
    setEnviando(true);
    try {
      const ref = `producto-${String(productoId ?? '').slice(0, 40)}`;
      await postCalificacionVendedor(solicitudId, {
        valor,
        comentario: comentario.trim() || undefined,
        referenciaOrden: ref.length <= 64 ? ref : ref.slice(0, 64),
      });
      setComentario('');
      setDraftStars(0);
      setHoverStar(0);
      await onExito?.();
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setError(
          'No se puede registrar ahora: la solicitud del vendedor debe estar ACTIVA o EN_MORA (regla del marketplace).',
        );
      } else if (status === 404) {
        setError('No se encontró la solicitud del vendedor en el servidor.');
      } else {
        setError(getRequestErrorMessage(err));
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="mt-5 border-t border-border pt-5">
      <p className="text-sm font-medium text-text-primary">Calificar al vendedor</p>
      <p className="mt-1 text-xs text-text-muted">
        1 a 5 estrellas se envían como 2–10 puntos (promedio oficial sobre 10). Opcional: breve comentario.
      </p>
      <div
        className="mt-3 flex items-center gap-1"
        role="group"
        aria-label="Seleccionar estrellas"
        onMouseLeave={() => setHoverStar(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={draftStars === n}
            aria-label={`${n} de 5 estrellas`}
            disabled={enviando}
            className="rounded px-0.5 text-3xl leading-none transition hover:scale-110 disabled:opacity-50"
            onMouseEnter={() => setHoverStar(n)}
            onClick={() => setDraftStars(n)}
          >
            <span className={n <= preview ? 'text-amber-500' : 'text-border-strong'} aria-hidden>
              ★
            </span>
          </button>
        ))}
        {draftStars > 0 ? (
          <span className="ml-2 text-sm text-text-secondary">
            → {estrellasUiAValorApi(draftStars)}/10
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        <label htmlFor="rep-comentario" className="text-xs font-medium text-text-muted">
          Comentario (opcional, máx. 500)
        </label>
        <textarea
          id="rep-comentario"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          maxLength={500}
          rows={2}
          disabled={enviando}
          className="mt-1 w-full rounded-xl border border-border-strong bg-page px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
          placeholder="Ej. Entrega rápida, buen embalaje…"
        />
      </div>
      {error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={enviando || draftStars < 1}
        className="mt-3 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:opacity-50"
      >
        {enviando ? 'Enviando…' : 'Enviar calificación'}
      </button>
    </form>
  );
}

/**
 * Reputación (solicitud-service), FAQ estático y preguntas/comentarios (product-service).
 *
 * @param {{ productoId: number|string; vendedorSolicitudId?: number|string | null }} props
 */
export function ProductoComunidadPanel({ productoId, vendedorSolicitudId }) {
  const { rolesNormalized, isAuthenticated } = useAuth();
  const miSolicitudSesion = useSellerSolicitudSessionId();
  const esDueñoDelProducto =
    miSolicitudSesion != null &&
    vendedorSolicitudId != null &&
    vendedorSolicitudId !== '' &&
    String(miSolicitudSesion) === String(vendedorSolicitudId);
  const puedeResponderComoVendedorDueño = isVendedor(rolesNormalized) && esDueñoDelProducto;

  const [reputacion, setReputacion] = useState(null);
  const [repLoading, setRepLoading] = useState(false);
  /** Si false, no se llama al API de reputación (uso opcional). */
  const [repConsultaActiva, setRepConsultaActiva] = useState(true);
  const repFetchGen = useRef(0);
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [formTipo, setFormTipo] = useState('PREGUNTA');
  const [contenido, setContenido] = useState('');
  const [autorNombre, setAutorNombre] = useState('');
  const [submitErr, setSubmitErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [respDraftById, setRespDraftById] = useState({});

  const pid = productoId != null ? String(productoId) : '';

  const cargarInteracciones = useCallback(async () => {
    if (!pid) return;
    setLoadingList(true);
    try {
      const list = await listInteraccionesProducto(pid);
      setItems(list);
    } catch (e) {
      setSubmitErr(getRequestErrorMessage(e));
    } finally {
      setLoadingList(false);
    }
  }, [pid]);

  useEffect(() => {
    cargarInteracciones();
  }, [cargarInteracciones]);

  const recargarReputacion = useCallback(() => {
    if (vendedorSolicitudId == null || vendedorSolicitudId === '' || !repConsultaActiva) return;
    const gen = ++repFetchGen.current;
    setRepLoading(true);
    getReputacionResumen(vendedorSolicitudId)
      .then((r) => {
        if (repFetchGen.current !== gen) return;
        setReputacion(r);
      })
      .finally(() => {
        if (repFetchGen.current !== gen) return;
        setRepLoading(false);
      });
  }, [vendedorSolicitudId, repConsultaActiva]);

  useEffect(() => {
    if (vendedorSolicitudId == null || vendedorSolicitudId === '') {
      setReputacion(null);
      setRepLoading(false);
      return;
    }
    if (!repConsultaActiva) {
      setReputacion(null);
      setRepLoading(false);
      return;
    }
    let cancel = false;
    setRepLoading(true);
    getReputacionResumen(vendedorSolicitudId).then((r) => {
      if (cancel) return;
      setReputacion(r);
      setRepLoading(false);
    });
    return () => {
      cancel = true;
    };
  }, [vendedorSolicitudId, repConsultaActiva]);

  async function handlePublicar(e) {
    e.preventDefault();
    setSubmitErr('');
    const text = contenido.trim();
    if (!text) {
      setSubmitErr('Escriba su pregunta o comentario.');
      return;
    }
    setSubmitting(true);
    try {
      await crearInteraccionProducto(pid, {
        tipo: formTipo,
        contenido: text,
        autorNombre: autorNombre.trim() || undefined,
      });
      setContenido('');
      await cargarInteracciones();
    } catch (err) {
      setSubmitErr(getRequestErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResponder(interaccionId, texto) {
    const t = texto.trim();
    if (!t) return;
    setSubmitErr('');
    try {
      await responderInteraccionProducto(pid, interaccionId, { respuesta: t });
      setRespDraftById((prev) => ({ ...prev, [interaccionId]: '' }));
      await cargarInteracciones();
    } catch (err) {
      setSubmitErr(getRequestErrorMessage(err));
    }
  }

  return (
    <div className="mt-12 space-y-10">
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="font-sans text-lg font-semibold text-text-primary">Reputación del vendedor</h2>
          {vendedorSolicitudId != null && vendedorSolicitudId !== '' ? (
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border-strong text-brand focus:ring-brand/30"
                checked={repConsultaActiva}
                onChange={(e) => setRepConsultaActiva(e.target.checked)}
              />
              Consultar reputación en línea
            </label>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-text-muted">
          Opcional: usa el servicio de solicitudes. Si tu backend no expone aún la ruta, verás ceros sin bloquear la página.
        </p>
        {vendedorSolicitudId == null || vendedorSolicitudId === '' ? (
          <p className="mt-2 text-sm text-text-muted">
            Este producto no expone el identificador de vendedor para mostrar reputación.
          </p>
        ) : !repConsultaActiva ? (
          <p className="mt-3 text-sm text-text-muted">
            Consulta desactivada. Activa «Consultar reputación en línea» para cargar el resumen desde el servidor.
          </p>
        ) : repLoading ? (
          <p className="mt-3 text-sm text-text-muted">Cargando reputación…</p>
        ) : reputacion ? (
          <div className="mt-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <ReputacionVisual promedio={reputacion.promedioValor} total={reputacion.totalCalificaciones} />
              <button
                type="button"
                onClick={() => recargarReputacion()}
                disabled={repLoading}
                className="shrink-0 rounded-lg border border-border-strong px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:border-brand disabled:opacity-50"
              >
                Actualizar
              </button>
            </div>
            {reputacion.totalCalificaciones === 0 ? (
              <p className="mt-2 text-xs text-text-muted">
                Aún no hay calificaciones registradas para este vendedor (o el servicio respondió sin datos).
              </p>
            ) : null}
            <CalificarVendedorForm
              solicitudId={vendedorSolicitudId}
              productoId={productoId}
              esVendedorDelProducto={esDueñoDelProducto}
              isAuthenticated={isAuthenticated}
              onExito={recargarReputacion}
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="font-sans text-lg font-semibold text-text-primary">Preguntas frecuentes</h2>
        <ul className="mt-4 space-y-4">
          {PRODUCTO_FAQ_ITEMS.map((item) => (
            <li key={item.q} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <p className="font-medium text-text-primary">{item.q}</p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">{item.a}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="font-sans text-lg font-semibold text-text-primary">Preguntas y comentarios</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Publique una pregunta o un comentario sobre el producto. Solo el vendedor que publicó este artículo (misma
          solicitud en sesión) puede responder; caso estudio sin comprobación en servidor.
        </p>
        {isVendedor(rolesNormalized) && !esDueñoDelProducto && vendedorSolicitudId != null && vendedorSolicitudId !== '' ? (
          <p className="mt-2 text-xs text-text-muted">
            Está en sesión como vendedor, pero esta pestaña no está vinculada a la solicitud de este producto. Use «Sincronizar
            sesión» en el panel de vendedor con la solicitud correcta o cree la solicitud desde el mismo flujo.
          </p>
        ) : null}

        <form onSubmit={handlePublicar} className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="tipoInteraccion"
                checked={formTipo === 'PREGUNTA'}
                onChange={() => setFormTipo('PREGUNTA')}
              />
              Pregunta
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="tipoInteraccion"
                checked={formTipo === 'COMENTARIO'}
                onChange={() => setFormTipo('COMENTARIO')}
              />
              Comentario
            </label>
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Su nombre (opcional)</label>
            <input
              className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
              value={autorNombre}
              onChange={(e) => setAutorNombre(e.target.value)}
              maxLength={120}
              placeholder="Ej. María G."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Mensaje</label>
            <textarea
              className="mt-2 min-h-[100px] w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              maxLength={2000}
              required
              placeholder="Escriba aquí…"
            />
          </div>
          {submitErr ? (
            <p className="text-sm text-danger" role="alert">
              {submitErr}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:opacity-50"
          >
            {submitting ? 'Publicando…' : 'Publicar'}
          </button>
        </form>

        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">Publicaciones</h3>
          {loadingList ? (
            <p className="mt-3 text-sm text-text-muted">Cargando…</p>
          ) : items.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">Nadie ha publicado aún. Sea el primero.</p>
          ) : (
            <ul className="mt-4 space-y-5">
              {items.map((row) => (
                <li key={row.id} className="rounded-xl border border-border bg-page/50 px-4 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold uppercase text-brand">
                      {row.tipo === 'PREGUNTA' ? 'Pregunta' : 'Comentario'}
                    </span>
                    <span className="text-xs text-text-muted">{formatInstant(row.creadoEn)}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-text-primary">
                    {row.autorNombre?.trim() ? row.autorNombre : 'Comprador'}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{row.contenido}</p>
                  {row.tipo === 'PREGUNTA' && row.respuesta ? (
                    <div className="mt-3 rounded-lg border border-brand/20 bg-brand-soft/30 px-3 py-2">
                      <p className="text-xs font-semibold text-brand">Respuesta del vendedor</p>
                      <p className="mt-1 text-sm text-text-secondary">{row.respuesta}</p>
                    </div>
                  ) : null}
                  {row.tipo === 'PREGUNTA' && !row.respuesta && puedeResponderComoVendedorDueño ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                        rows={2}
                        placeholder="Responder como vendedor…"
                        value={respDraftById[row.id] ?? ''}
                        onChange={(e) =>
                          setRespDraftById((prev) => ({
                            ...prev,
                            [row.id]: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleResponder(row.id, respDraftById[row.id] ?? '')}
                        className="rounded-lg border border-border-strong px-3 py-1.5 text-xs font-semibold text-text-primary transition hover:border-brand"
                      >
                        Enviar respuesta
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
