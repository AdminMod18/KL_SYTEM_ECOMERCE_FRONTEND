export function formatCardNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiry(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  if (digits.length === 1) return digits;
  let month = digits.slice(0, 2);
  if (Number(month) > 12) month = '12';
  if (Number(month) === 0) month = '01';
  if (digits.length === 2) return month;
  return `${month}/${digits.slice(2, 4)}`;
}

export function cardBrandLabel(num) {
  const d = String(num ?? '').replace(/\D/g, '');
  if (/^4/.test(d)) return 'VISA';
  if (/^5[1-5]/.test(d)) return 'MASTERCARD';
  if (/^3[47]/.test(d)) return 'AMEX';
  return 'PREMIUM';
}

/** Enmascara el PAN sin perder dígitos visibles (• no pasa por replace(/\D/g)). */
export function displayCardNumber(num) {
  const digits = String(num ?? '').replace(/\D/g, '').slice(0, 16);
  const groups = [];
  for (let g = 0; g < 4; g += 1) {
    let group = '';
    for (let d = 0; d < 4; d += 1) {
      const idx = g * 4 + d;
      if (idx < digits.length) {
        group += idx < digits.length - 4 ? '•' : digits[idx];
      } else {
        group += '•';
      }
    }
    groups.push(group);
  }
  return groups.join(' ');
}

export function displayExpiry(value) {
  const formatted = formatExpiry(value);
  return formatted || 'MM/YY';
}
