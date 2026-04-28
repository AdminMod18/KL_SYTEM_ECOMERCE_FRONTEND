/** Precios en COP backend vs USD demo (montos pequeños). */
export function formatMoney(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  if (n > 50000) {
    return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: n % 1 ? 2 : 0 });
}
