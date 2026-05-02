import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  actualizarParametro,
  listarAuditoria,
  listarLogsError,
  listarParametros,
} from '../services/adminService.js';
import { getRequestErrorMessage } from '../utils/apiError.js';

const SECCIONES = [
  { id: 'parametros', label: 'Parámetros' },
  { id: 'auditoria', label: 'Auditoría (demo)' },
  { id: 'logs', label: 'Logs de error (demo)' },
];

function fmtInstant(iso) {
  if (iso == null || iso === '') return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

export function PanelAdmin() {
  const [seccion, setSeccion] = useState('parametros');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [cargando, setCargando] = useState(false);

  const [parametros, setParametros] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [logs, setLogs] = useState([]);
  const [editValor, setEditValor] = useState({});
  const [guardandoClave, setGuardandoClave] = useState(null);

  const cargarTodo = useCallback(async () => {
    setError('');
    setInfo('');
    setCargando(true);
    try {
      const [p, a, l] = await Promise.all([listarParametros(), listarAuditoria(), listarLogsError()]);
      setParametros(Array.isArray(p) ? p : []);
      setAuditoria(Array.isArray(a) ? a : []);
      setLogs(Array.isArray(l) ? l : []);
      const inicial = {};
      (Array.isArray(p) ? p : []).forEach((row) => {
        if (row?.clave != null) inicial[row.clave] = row.valor ?? '';
      });
      setEditValor(inicial);
    } catch (err) {
      setParametros([]);
      setAuditoria([]);
      setLogs([]);
      setError(getRequestErrorMessage(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarTodo();
  }, [cargarTodo]);

  async function handleGuardarParametro(clave) {
    const valor = String(editValor[clave] ?? '').trim();
    setError('');
    setInfo('');
    setGuardandoClave(clave);
    try {
      await actualizarParametro(clave, valor);
      setInfo(
        'Valor guardado en admin-service. solicitud-service aplicará los cambios en la próxima sincronización (por defecto cada pocos minutos) si tiene configurada INTEGRACION_ADMIN_BASE_URL.',
      );
      await cargarTodo();
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setGuardandoClave(null);
    }
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Director · Administración</p>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Parámetros del sistema
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Caso estudio: parametrización central (admin-service), auditoría y logs en modo demo. En desarrollo use el
            proxy <code className="text-xs">/api/admin</code> y el servicio en el puerto 9010.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void cargarTodo()}
            disabled={cargando}
            className="rounded-xl border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:bg-page disabled:opacity-50"
          >
            Actualizar
          </button>
          <Link
            to="/director"
            className="rounded-xl border border-border-strong px-4 py-2 text-sm font-semibold text-text-primary hover:bg-page"
          >
            ← Solicitudes
          </Link>
          <Link
            to="/director/bam"
            className="rounded-xl border border-border-strong px-4 py-2 text-sm font-semibold text-text-primary hover:bg-page"
          >
            BAM
          </Link>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {SECCIONES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSeccion(s.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              seccion === s.id
                ? 'bg-black text-white'
                : 'bg-page text-text-secondary hover:text-text-primary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {cargando ? <p className="text-sm text-text-muted">Cargando…</p> : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error} · Compruebe que admin-service esté en ejecución (puerto 9010) y la variable{' '}
          <code className="text-xs">VITE_ADMIN_URL</code> si usa build fuera del proxy por defecto.
        </div>
      ) : null}

      {info ? (
        <div className="mb-4 rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-900">
          {info}
        </div>
      ) : null}

      {seccion === 'parametros' && !cargando ? (
        <section className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-page">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">Clave</th>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">Valor</th>
                <th className="px-4 py-3 text-left font-semibold text-text-muted">Actualizado</th>
                <th className="px-4 py-3 text-right font-semibold text-text-primary">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {parametros.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                    No hay parámetros. ¿Está arrancado admin-service?
                  </td>
                </tr>
              ) : (
                parametros.map((row) => (
                  <tr key={row.clave} className="hover:bg-page/80">
                    <td className="max-w-[220px] whitespace-normal break-all px-4 py-3 font-mono text-xs text-text-primary">
                      {row.clave}
                    </td>
                    <td className="min-w-[200px] px-4 py-3">
                      <input
                        type="text"
                        className="w-full rounded-lg border border-border-strong bg-page px-3 py-2 font-mono text-xs text-text-primary"
                        value={editValor[row.clave] ?? ''}
                        onChange={(e) =>
                          setEditValor((prev) => ({
                            ...prev,
                            [row.clave]: e.target.value,
                          }))
                        }
                        aria-label={`Valor para ${row.clave}`}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-text-muted">{fmtInstant(row.actualizadoEn)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={guardandoClave === row.clave}
                        onClick={() => void handleGuardarParametro(row.clave)}
                        className="rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/90 disabled:opacity-50"
                      >
                        {guardandoClave === row.clave ? 'Guardando…' : 'Guardar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      ) : null}

      {seccion === 'auditoria' && !cargando ? (
        <section className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-page">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">Actor</th>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">Acción</th>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditoria.map((row, i) => (
                <tr key={`${row.ocurridoEn}-${i}`} className="hover:bg-page/80">
                  <td className="whitespace-nowrap px-4 py-3 text-text-muted">{fmtInstant(row.ocurridoEn)}</td>
                  <td className="px-4 py-3 text-text-primary">{row.actor}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">{row.accion}</td>
                  <td className="max-w-md px-4 py-3 text-text-secondary">{row.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {seccion === 'logs' && !cargando ? (
        <section className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-page">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">Nivel</th>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">Origen</th>
                <th className="px-4 py-3 text-left font-semibold text-text-primary">Mensaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((row, i) => (
                <tr key={`${row.ocurridoEn}-${i}`} className="hover:bg-page/80">
                  <td className="whitespace-nowrap px-4 py-3 text-text-muted">{fmtInstant(row.ocurridoEn)}</td>
                  <td className="px-4 py-3 font-semibold text-text-primary">{row.nivel}</td>
                  <td className="px-4 py-3 text-text-secondary">{row.origen}</td>
                  <td className="max-w-lg px-4 py-3 text-text-secondary">{row.mensaje}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
