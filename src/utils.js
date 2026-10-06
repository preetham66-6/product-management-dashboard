export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
export function debounce(fn, delay = 250) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
export function escapeHtml(str) {
  const el = document.createElement('span');
  el.textContent = String(str ?? '');
  return el.innerHTML;
}
export function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random hex
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}
export function getStockStatus(stock) {
  if (stock === 0)  return { label: 'Out of Stock', color: 'red'   };
  if (stock <= 10)  return { label: 'Low Stock',    color: 'amber' };
  return               { label: 'In Stock',      color: 'green' };
}
export const BADGE_CLASSES = {
  red:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};
