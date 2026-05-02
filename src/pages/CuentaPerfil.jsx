import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES, hasAnyRole, isAdmin, isVendedor } from '../auth/roles.js';

function Card({ to, title, description, eyebrow }) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-card transition hover:border-cart-badge/40 hover:shadow-md"
    >
      {eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{eyebrow}</p> : null}
      <h2 className="mt-2 font-sans text-lg font-semibold text-text-primary group-hover:text-cart-badge">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cart-badge">
        Abrir
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}

export function CuentaPerfil() {
  const { username, roles } = useAuth();
  const [params] = useSearchParams();
  const forbidden = params.get('forbidden') === '1';
  const admin = isAdmin(roles);
  const vendedor = isVendedor(roles);
  const puedeTienda = hasAnyRole(roles, [ROLES.COMPRADOR, ROLES.USER, ROLES.VENDEDOR, ROLES.ADMIN]);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Tu cuenta</p>
        <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
          Hola{username ? `, ${username}` : ''}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary">
          Este panel agrupa las acciones disponibles según tu rol en el marketplace. Los permisos reales siguen validándose en cada
          servicio en el servidor.
        </p>
        {roles?.length ? (
          <p className="mt-4 text-xs text-text-muted">
            Roles activos: <span className="font-medium text-text-primary">{normalizeRolesDisplay(roles)}</span>
          </p>
        ) : null}
      </header>

      {forbidden ? (
        <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-text-primary">
          No tienes permiso para ver esa sección. Si crees que es un error, contacta a un administrador.
        </div>
      ) : null}

      <section>
        <h2 className="font-sans text-lg font-semibold text-text-primary">Comprador</h2>
        <p className="mt-1 text-sm text-text-secondary">Catálogo, carrito y checkout.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {puedeTienda ? (
            <>
              <Card to="/catalog" eyebrow="Tienda" title="Explorar catálogo" description="Busca productos y añade al carrito." />
              <Card to="/cart" eyebrow="Pedido" title="Tu carrito" description="Revisa artículos antes de pagar." />
              <Card to="/checkout" eyebrow="Pago" title="Checkout" description="Completa la compra cuando estés listo." />
              <Card
                to="/cuenta/pedidos"
                eyebrow="Historial"
                title="Mis pedidos"
                description="Órdenes asociadas a tu ID de cliente (HU-20)."
              />
            </>
          ) : (
            <p className="text-sm text-text-muted">No hay rutas de comprador disponibles para tu sesión.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-sans text-lg font-semibold text-text-primary">Vendedor</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Registro único como comprador; para vender sigues el caso de estudio (solicitud → validación → pago → ACTIVA). Para que se te
          asigne automáticamente el rol <strong>VENDEDOR</strong>, usa en la solicitud el mismo <strong>documento</strong> y/o{' '}
          <strong>correo</strong> que en tu alta como usuario.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card
            to="/seller"
            eyebrow={vendedor ? 'Activo' : 'Onboarding'}
            title="Panel de vendedor"
            description="Solicitud, validación y herramientas para publicar desde la plataforma."
          />
        </div>
      </section>

      {admin ? (
        <section>
          <h2 className="font-sans text-lg font-semibold text-text-primary">Administración</h2>
          <p className="mt-1 text-sm text-text-secondary">Operación, solicitudes y parámetros (solo rol ADMIN).</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card to="/director" eyebrow="Operación" title="Director" description="Bandeja de solicitudes y seguimiento." />
            <Card to="/director/bam" eyebrow="Analítica" title="BAM" description="Vista BAM (demo)." />
            <Card to="/director/admin" eyebrow="Sistema" title="Admin" description="Parámetros, auditoría y logs (demo)." />
          </div>
        </section>
      ) : null}

      <p className="text-center text-xs text-text-muted">
        <Link to="/" className="font-semibold text-cart-badge hover:underline">
          Volver al inicio público
        </Link>
      </p>
    </div>
  );
}

function normalizeRolesDisplay(roles) {
  return [...new Set((roles ?? []).map((r) => String(r).toUpperCase()))].join(', ');
}
