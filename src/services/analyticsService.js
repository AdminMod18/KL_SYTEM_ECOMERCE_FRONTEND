import axios from 'axios';

function analyticsBase() {
  return (import.meta.env.VITE_ANALYTICS_URL ?? '/api/analytics').replace(/\/$/, '');
}

export async function obtenerKpis() {
  const { data } = await axios.get(`${analyticsBase()}/kpis`, { timeout: 15000 });
  return data;
}

const TIPOS_EVENTO_VALIDOS = /** @type {const} */ (['COMPRA', 'SOLICITUD_APROBADA', 'CONSULTA_CATALOGO']);

/**
 * Registra consulta de catálogo u otra métrica (alimenta HU-23 / tendencias).
 * Fallos de red se ignoran (best-effort).
 * @param {{ tipo: string; referencia: string; valorMonetario?: number }} req referencia ≤120 chars
 */
export async function registrarEventoMetrica(req) {
  const tipoRaw = String(req?.tipo ?? '').trim();
  const tipo = TIPOS_EVENTO_VALIDOS.includes(tipoRaw) ? tipoRaw : 'CONSULTA_CATALOGO';
  let referencia = String(req?.referencia ?? '').trim().slice(0, 120);
  if (!referencia) referencia = 'vista:sin-referencia';

  const body = { tipo, referencia };
  const vm = Number(req?.valorMonetario);
  if (req?.valorMonetario != null && Number.isFinite(vm) && vm >= 0) {
    body.valorMonetario = vm;
  }
  try {
    await axios.post(`${analyticsBase()}/eventos`, body, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    /* storefront: analítica opcional */
  }
}

function normalizarEstado(estado) {
  return String(estado ?? '').trim().toUpperCase();
}

function normalizarSku(value, fallback) {
  const sku = String(value ?? '').trim();
  return sku || fallback;
}

function lineasDesdeOrden(orden, fallbackLineas = []) {
  const raw = Array.isArray(orden?.lineas) && orden.lineas.length ? orden.lineas : fallbackLineas;
  return raw
    .map((ln, index) => {
      const cantidad = Math.max(1, Math.floor(Number(ln?.cantidad)) || 1);
      const precioUnitario = Number(ln?.precioUnitario ?? ln?.precio ?? 0);
      const totalLinea = Number(ln?.totalLinea ?? ln?.subtotal ?? precioUnitario * cantidad);
      return {
        sku: normalizarSku(ln?.sku, `ORDEN-${orden?.ordenId ?? orden?.id ?? 'SIN-ID'}-ITEM-${index + 1}`),
        valorMonetario: Number.isFinite(totalLinea) && totalLinea >= 0 ? totalLinea : undefined,
      };
    })
    .filter((ln) => ln.sku);
}

export async function registrarCompraOrden(orden, fallbackLineas = []) {
  const lineas = lineasDesdeOrden(orden, fallbackLineas);
  if (!lineas.length) {
    await registrarEventoMetrica({
      tipo: 'COMPRA',
      referencia: `orden:${orden?.ordenId ?? orden?.id ?? 'sin-id'}`,
      valorMonetario: Number(orden?.total),
    });
    return;
  }

  await Promise.all(
    lineas.map((ln) =>
      registrarEventoMetrica({
        tipo: 'COMPRA',
        referencia: ln.sku,
        valorMonetario: ln.valorMonetario,
      }),
    ),
  );
}

export async function registrarSolicitudAprobada(solicitud) {
  if (normalizarEstado(solicitud?.estado) !== 'APROBADA') return;
  await registrarEventoMetrica({
    tipo: 'SOLICITUD_APROBADA',
    referencia: `solicitud:${solicitud?.id ?? solicitud?.solicitudId ?? 'sin-id'}`,
  });
}
