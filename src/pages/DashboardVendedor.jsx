import { SellerOnboardingPanel } from '../components/SellerOnboardingPanel.jsx';

export function DashboardVendedor() {
  const stats = [
    { label: 'Sales (7d)', value: '$12.4k', delta: '+8%', tone: 'text-success' },
    { label: 'Orders', value: '128', delta: '+3%', tone: 'text-brand' },
    { label: 'Conversion', value: '3.2%', delta: '+0.4pp', tone: 'text-success' },
    { label: 'Returns', value: '1.1%', delta: '-0.2pp', tone: 'text-warning' },
  ];

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Seller</p>
        <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          Panel de vendedor
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Activa tu cuenta (solicitud + validacion + pago) y publica productos sin herramientas externas.
        </p>
      </header>

      <SellerOnboardingPanel />

      <section className="mt-12">
        <h2 className="mb-4 font-sans text-lg font-semibold text-text-primary">Resumen demo</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{s.label}</p>
              <p className="mt-3 font-sans text-2xl font-semibold tabular-nums text-text-primary">{s.value}</p>
              <p className={`mt-1 text-sm font-semibold ${s.tone}`}>{s.delta}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
