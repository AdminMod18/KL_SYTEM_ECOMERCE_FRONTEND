import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerKpis } from '../services/analyticsService.js';
import { getRequestErrorMessage } from '../utils/apiError.js';
import { motion } from 'framer-motion';

export function PanelBam() {
  const [kpi, setKpi] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setError('');
    obtenerKpis()
      .then((d) => {
        if (!cancel) setKpi(d);
      })
      .catch((e) => {
        if (!cancel) setError(getRequestErrorMessage(e));
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Director · BAM</p>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Tablero de control <span className="gradient-text">(KPIs)</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            HU-23: KPIs demo desde analytics-service. El catálogo envía <code className="text-xs">CONSULTA_CATALOGO</code> vía{' '}
            <code className="text-xs">POST /eventos</code>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/director"
            className="rounded-xl border border-border-strong px-4 py-2 text-sm font-semibold text-text-primary hover:bg-page"
          >
            ← Solicitudes
          </Link>
          <Link
            to="/director/admin"
            className="rounded-xl border border-border-strong px-4 py-2 text-sm font-semibold text-text-primary hover:bg-page"
          >
            Parámetros
          </Link>
        </div>
      </header>

      {loading ? <p className="text-sm text-text-muted">Cargando indicadores…</p> : null}
      {error ? (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error} · Asegúrese de que analytics-service esté en ejecución (p. ej. puerto 9009) y el proxy{' '}
          <code className="text-xs">/api/analytics</code> configurado.
        </div>
      ) : null}

      {kpi && !loading ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div whileHover={{ y: -4 }} className="glass-panel premium-card-hover rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Eventos totales</p>
            <p className="mt-2 font-sans text-2xl font-bold tabular-nums text-text-primary">{kpi.totalEventos}</p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="glass-panel premium-card-hover rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Compras registradas</p>
            <p className="mt-2 font-sans text-2xl font-bold tabular-nums text-text-primary">{kpi.comprasRegistradas}</p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="glass-panel premium-card-hover rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Ingresos compras</p>
            <p className="mt-2 font-sans text-2xl font-bold tabular-nums text-text-primary">
              {kpi.ingresosComprasAcumulados != null ? String(kpi.ingresosComprasAcumulados) : '—'}
            </p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="glass-panel premium-card-hover rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Solicitudes aprobadas (eventos)</p>
            <p className="mt-2 font-sans text-2xl font-bold tabular-nums text-text-primary">
              {kpi.solicitudesAprobadasRegistradas}
            </p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="glass-panel premium-card-hover rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Consultas catálogo</p>
            <p className="mt-2 font-sans text-2xl font-bold tabular-nums text-text-primary">
              {kpi.consultasCatalogoRegistradas ?? 0}
            </p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="glass-panel premium-card-hover rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">SKU más frecuente (compras)</p>
            <p className="mt-2 break-all text-sm font-medium text-text-primary">{kpi.skuCompraMasFrecuente ?? '—'}</p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="glass-panel premium-card-hover rounded-2xl p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Consulta catálogo top</p>
            <p className="mt-2 break-all text-sm font-medium text-text-primary">{kpi.textoConsultaMasFrecuente ?? '—'}</p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="glass-panel premium-card-hover rounded-2xl p-5 sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Resumen marketing / tendencias</p>
            <p className="mt-2 text-sm leading-relaxed text-text-primary">{kpi.tendenciasMarketingResumen ?? '—'}</p>
          </motion.div>
          <motion.div whileHover={{ y: -4 }} className="glass-panel premium-card-hover rounded-2xl p-5 sm:col-span-2 lg:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Último evento</p>
            <p className="mt-2 text-sm text-text-primary">{kpi.ultimoEventoEn ?? '—'}</p>
          </motion.div>
        </section>
      ) : null}
    </div>
  );
}
