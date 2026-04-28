export function DashboardVendedor() {
  const stats = [
    { label: 'Sales (7d)', value: '$12.4k', delta: '+8%', tone: 'text-success' },
    { label: 'Orders', value: '128', delta: '+3%', tone: 'text-brand' },
    { label: 'Conversion', value: '3.2%', delta: '+0.4pp', tone: 'text-success' },
    { label: 'Returns', value: '1.1%', delta: '-0.2pp', tone: 'text-warning' },
  ];

  const rows = [
    { id: '#48291', buyer: 'María G.', product: 'Premium Wireless Headphones', total: '$899', status: 'Shipped' },
    { id: '#48290', buyer: 'Carlos R.', product: 'Luxury Smart Watch', total: '$1,299', status: 'Processing' },
    { id: '#48289', buyer: 'Ana P.', product: 'Professional Camera Kit', total: '$4,599', status: 'Pending' },
  ];

  return (
    <div>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Seller</p>
        <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Performance overview. Connect inventory and order APIs when ready.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{s.label}</p>
            <p className="mt-3 font-sans text-2xl font-semibold tabular-nums text-text-primary">{s.value}</p>
            <p className={`mt-1 text-sm font-semibold ${s.tone}`}>{s.delta}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-sans text-lg font-semibold text-text-primary">Recent orders</h2>
          <button
            type="button"
            className="rounded-xl border border-border-strong px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand"
          >
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-page text-xs font-semibold uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Buyer</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-text-primary">{r.id}</td>
                  <td className="px-5 py-4 text-text-secondary">{r.buyer}</td>
                  <td className="px-5 py-4 text-text-secondary">{r.product}</td>
                  <td className="px-5 py-4 font-semibold text-text-primary">{r.total}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full border border-border bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
