import { SellerOnboardingPanel } from '../components/SellerOnboardingPanel.jsx';

export function DashboardVendedor() {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Vendedor</p>
        <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          Activa tu tienda en <span className="gradient-text">Mercado</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-text-secondary sm:mx-0">
          Sigue los pasos del flujo: solicitud, validación, pago e inventario. Solo verás la etapa en la que estás.
        </p>
      </header>

      <SellerOnboardingPanel />
    </div>
  );
}
