import {
  formatCurrency,
  getStockStatus,
  BADGE_CLASSES,
} from './utils.js';
import {
  getDerivedProducts,
  getSummary,
  getCategories,
  hasActiveFilters,
  getCategory,
} from './state.js';

let toastTimer = null;
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colors = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    info:    'bg-blue-600',
  };

  const icons = {
    success: 'check-circle',
    error:   'alert-circle',
    info:    'info',
  };

  const toast = document.createElement('div');
  toast.className = [
    'pointer-events-auto',
    'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium',
    colors[type] ?? colors.info,
    'transform transition-all duration-300 translate-y-2 opacity-0',
  ].join(' ');
  toast.setAttribute('role', 'status');

  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', icons[type] ?? 'info');
  icon.className = 'w-4 h-4 shrink-0';

  const text = document.createElement('span');
  text.textContent = message; // Safe — textContent, never innerHTML

  toast.appendChild(icon);
  toast.appendChild(text);
  container.appendChild(toast);

  // Trigger CSS entrance animation on next paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Auto-dismiss
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3500);
}

export function renderSummary() {
  const { total, totalValue, lowStock, outOfStock } = getSummary();

  const cards = [
    {
      label:  'Total Products',
      value:  total,
      icon:   'package',
      accent: 'text-violet-600 dark:text-violet-400',
      bg:     'bg-violet-50 dark:bg-violet-900/20',
    },
    {
      label:  'Inventory Value',
      value:  formatCurrency(totalValue),
      icon:   'dollar-sign',
      accent: 'text-emerald-600 dark:text-emerald-400',
      bg:     'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label:  'Low Stock Items',
      value:  lowStock,
      icon:   'alert-triangle',
      accent: 'text-amber-600 dark:text-amber-400',
      bg:     'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label:  'Out of Stock',
      value:  outOfStock,
      icon:   'x-circle',
      accent: 'text-red-600 dark:text-red-400',
      bg:     'bg-red-50 dark:bg-red-900/20',
    },
  ];

  const container = document.getElementById('summary-cards');
  if (!container) return;
  container.innerHTML = '';

  cards.forEach(({ label, value, icon, accent, bg }) => {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 shadow-sm';

    const iconWrap = document.createElement('div');
    iconWrap.className = `${bg} rounded-lg p-3 shrink-0`;

    const iconEl = document.createElement('i');
    iconEl.setAttribute('data-lucide', icon);
    iconEl.className = `w-6 h-6 ${accent}`;
    iconWrap.appendChild(iconEl);

    const textWrap = document.createElement('div');

    const valueEl = document.createElement('p');
    valueEl.className = 'text-2xl font-bold text-gray-900 dark:text-white tabular-nums';
    valueEl.textContent = value;

    const labelEl = document.createElement('p');
    labelEl.className = 'text-xs text-gray-500 dark:text-gray-400 mt-0.5';
    labelEl.textContent = label;

    textWrap.appendChild(valueEl);
    textWrap.appendChild(labelEl);
    card.appendChild(iconWrap);
    card.appendChild(textWrap);
    container.appendChild(card);
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}
export function renderCategoryFilter() {
  const select = document.getElementById('filter-category');
  if (!select) return;

  const current = getCategory();
  const categories = getCategories();

  select.innerHTML = '';

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = 'All Categories';
  select.appendChild(defaultOpt);

  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;

    if (cat === current) {
      opt.selected = true;
    }

    select.appendChild(opt);
  });
}
export function renderProductList() {
  const container = document.getElementById('product-list');
  if (!container) return;

  const products = getDerivedProducts();
  container.innerHTML = '';

  if (products.length === 0) {
    renderEmptyState(container);
    return;
  }

    const tableWrap = document.createElement('div');
  tableWrap.className = 'hidden md:block overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm';

  const table = document.createElement('table');
  table.className = 'w-full text-sm text-left';
  table.setAttribute('aria-label', 'Products table');

  const thead = document.createElement('thead');
  thead.className = 'bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-500 dark:text-gray-400';
  thead.innerHTML = `
    <tr>
      <th class="px-4 py-3 font-medium" scope="col">Product</th>
      <th class="px-4 py-3 font-medium" scope="col">Category</th>
      <th class="px-4 py-3 font-medium text-right" scope="col">Price</th>
      <th class="px-4 py-3 font-medium text-center" scope="col">Stock</th>
      <th class="px-4 py-3 font-medium text-center" scope="col">Status</th>
      <th class="px-4 py-3 font-medium text-right" scope="col">Actions</th>
    </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  tbody.className = 'divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900';

  products.forEach((p) => tbody.appendChild(buildTableRow(p)));

  table.appendChild(tbody);
  tableWrap.appendChild(table);
  container.appendChild(tableWrap);

   const cardList = document.createElement('div');
  cardList.className = 'md:hidden space-y-3';
  products.forEach((p) => cardList.appendChild(buildMobileCard(p)));
  container.appendChild(cardList);

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function buildTableRow(product) {
  const { label, color } = getStockStatus(product.stock);
  const badgeClass = BADGE_CLASSES[color];

  const tr = document.createElement('tr');
  tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors';
  tr.setAttribute('data-id', product.id);

  // Name — clickable to open detail
  const tdName = document.createElement('td');
  tdName.className = 'px-4 py-3 max-w-xs';
  const nameBtn = document.createElement('button');
  nameBtn.type = 'button';
  nameBtn.className = 'font-medium text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 text-left transition-colors js-view-product truncate block max-w-full';
  nameBtn.setAttribute('data-id', product.id);
  nameBtn.setAttribute('aria-label', `View details for ${product.name}`);
  nameBtn.textContent = product.name;
  tdName.appendChild(nameBtn);

  const tdCat = document.createElement('td');
  tdCat.className = 'px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap';
  tdCat.textContent = product.category;

  const tdPrice = document.createElement('td');
  tdPrice.className = 'px-4 py-3 text-right font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap';
  tdPrice.textContent = formatCurrency(product.price);

  const tdStock = document.createElement('td');
  tdStock.className = 'px-4 py-3 text-center text-gray-700 dark:text-gray-300 tabular-nums';
  tdStock.textContent = product.stock;

  const tdStatus = document.createElement('td');
  tdStatus.className = 'px-4 py-3 text-center';
  const badge = document.createElement('span');
  badge.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${badgeClass}`;
  badge.textContent = label;
  tdStatus.appendChild(badge);

  const tdActions = document.createElement('td');
  tdActions.className = 'px-4 py-3';
  tdActions.appendChild(buildActionButtons(product.id, product.name, 'table'));

  tr.appendChild(tdName);
  tr.appendChild(tdCat);
  tr.appendChild(tdPrice);
  tr.appendChild(tdStock);
  tr.appendChild(tdStatus);
  tr.appendChild(tdActions);

  return tr;
}

function buildMobileCard(product) {
  const { label, color } = getStockStatus(product.stock);
  const badgeClass = BADGE_CLASSES[color];

  const card = document.createElement('div');
  card.className = 'bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm';
  card.setAttribute('data-id', product.id);

  const header = document.createElement('div');
  header.className = 'flex items-start justify-between gap-3 mb-2';

  const nameBtn = document.createElement('button');
  nameBtn.type = 'button';
  nameBtn.className = 'font-semibold text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 text-left leading-snug js-view-product';
  nameBtn.setAttribute('data-id', product.id);
  nameBtn.setAttribute('aria-label', `View details for ${product.name}`);
  nameBtn.textContent = product.name;

  const badge = document.createElement('span');
  badge.className = `shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`;
  badge.textContent = label;

  header.appendChild(nameBtn);
  header.appendChild(badge);

  const meta = document.createElement('div');
  meta.className = 'flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-3';

  const catSpan = document.createElement('span');
  catSpan.textContent = product.category;

  const sep = document.createElement('span');
  sep.className = 'text-gray-300 dark:text-gray-600';
  sep.textContent = '·';

  const priceSpan = document.createElement('span');
  priceSpan.className = 'font-mono font-medium text-gray-700 dark:text-gray-300';
  priceSpan.textContent = formatCurrency(product.price);

  const sep2 = sep.cloneNode(true);

  const stockSpan = document.createElement('span');
  stockSpan.textContent = `Qty: ${product.stock}`;

  meta.append(catSpan, sep, priceSpan, sep2, stockSpan);

  card.appendChild(header);
  card.appendChild(meta);
  card.appendChild(buildActionButtons(product.id, product.name, 'card'));

  return card;
}

function buildActionButtons(id, name, context) {
  const wrap = document.createElement('div');
  wrap.className = context === 'table'
    ? 'flex items-center justify-end gap-1'
    : 'flex items-center gap-2';

  const btnBase = 'inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';

  function makeBtn(cssClass, lucideIcon, label, extraClass) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `${btnBase} ${cssClass} ${extraClass}`;
    btn.setAttribute('data-id', id);
    btn.setAttribute('aria-label', `${label} ${name}`);
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', lucideIcon);
    icon.className = 'w-4 h-4';
    btn.appendChild(icon);
    return btn;
  }

  wrap.appendChild(makeBtn(
    'text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30',
    'eye', 'View', 'js-view-product'
  ));
  wrap.appendChild(makeBtn(
    'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30',
    'pencil', 'Edit', 'js-edit-product'
  ));
  wrap.appendChild(makeBtn(
    'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30',
    'trash-2', 'Delete', 'js-delete-product'
  ));

  return wrap;
}
function renderEmptyState(container) {
  const filtersActive = hasActiveFilters();

  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm';

  const iconEl = document.createElement('i');
  iconEl.setAttribute('data-lucide', filtersActive ? 'search-x' : 'package');
  iconEl.className = 'w-12 h-12 text-gray-300 dark:text-gray-600 mb-4';
  wrap.appendChild(iconEl);

  const heading = document.createElement('h3');
  heading.className = 'text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1';
  heading.textContent = filtersActive ? 'No products match your filters' : 'No products yet';
  wrap.appendChild(heading);

  const sub = document.createElement('p');
  sub.className = 'text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs';
  sub.textContent = filtersActive
    ? 'Try adjusting your search or filters.'
    : 'Get started by adding your first product.';
  wrap.appendChild(sub);

  if (filtersActive) {
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.id = 'btn-clear-filters';
    clearBtn.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'x');
    icon.className = 'w-4 h-4';
    clearBtn.appendChild(icon);
    clearBtn.appendChild(document.createTextNode('Clear all filters'));
    wrap.appendChild(clearBtn);
  } else {
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.id = 'btn-empty-add';
    addBtn.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'plus');
    icon.className = 'w-4 h-4';
    addBtn.appendChild(icon);
    addBtn.appendChild(document.createTextNode('Add your first product'));
    wrap.appendChild(addBtn);
  }

  container.appendChild(wrap);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
export function renderSkeleton() {
  const container = document.getElementById('product-list');
  if (!container) return;

  const wrap = document.createElement('div');
  wrap.className = 'bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden';

  const skeletonRowWidths = [
    ['w-48', 'w-24', 'w-16', 'w-12', 'w-20'],
    ['w-36', 'w-28', 'w-20', 'w-8',  'w-24'],
    ['w-52', 'w-20', 'w-14', 'w-10', 'w-20'],
    ['w-40', 'w-32', 'w-18', 'w-12', 'w-24'],
    ['w-44', 'w-24', 'w-16', 'w-8',  'w-20'],
    ['w-38', 'w-28', 'w-12', 'w-14', 'w-20'],
  ];

  skeletonRowWidths.forEach((widths) => {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-6 px-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 animate-pulse';
    widths.forEach((w) => {
      const skel = document.createElement('div');
      skel.className = `bg-gray-200 dark:bg-gray-700 h-4 ${w} rounded shrink-0`;
      row.appendChild(skel);
    });
    wrap.appendChild(row);
  });

  container.innerHTML = '';
  container.appendChild(wrap);
}
export function buildFormModal(product = null) {
  const isEdit = product !== null;

  const backdrop = document.createElement('div');
  backdrop.id = 'form-modal';
  backdrop.className = 'fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'modal-title');

  const panel = document.createElement('div');
  panel.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto';

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 rounded-t-2xl';

  const title = document.createElement('h2');
  title.id = 'modal-title';
  title.className = 'text-lg font-semibold text-gray-900 dark:text-white';
  title.textContent = isEdit ? 'Edit Product' : 'Add New Product';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.id = 'btn-close-modal';
  closeBtn.className = 'inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';
  closeBtn.setAttribute('aria-label', 'Close modal');
  const closeIcon = document.createElement('i');
  closeIcon.setAttribute('data-lucide', 'x');
  closeIcon.className = 'w-4 h-4';
  closeBtn.appendChild(closeIcon);

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Form
  const form = document.createElement('form');
  form.id = 'product-form';
  form.className = 'px-6 py-5 space-y-5';
  form.noValidate = true;
  if (isEdit) form.setAttribute('data-edit-id', product.id);

  form.appendChild(buildInputField({
    id: 'field-name', label: 'Product Name', type: 'text',
    placeholder: 'e.g., Wireless Headphones', required: true,
    value: product?.name ?? '',
    hint: '2–80 characters',
  }));

  form.appendChild(buildCategoryField(product?.category ?? ''));

  form.appendChild(buildInputField({
    id: 'field-price', label: 'Price (USD)', type: 'number',
    placeholder: '0.00', required: true,
    value: product?.price != null ? String(product.price) : '',
    hint: 'Greater than 0 · max 2 decimal places',
    min: '0.01', step: '0.01',
  }));

  form.appendChild(buildInputField({
    id: 'field-stock', label: 'Stock Quantity', type: 'number',
    placeholder: '0', required: true,
    value: product?.stock != null ? String(product.stock) : '',
    hint: 'Whole number · 0 or more',
    min: '0', step: '1',
  }));

  form.appendChild(buildTextareaField(product?.description ?? ''));

  // Footer
  const footer = document.createElement('div');
  footer.className = 'px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.id = 'btn-cancel-modal';
  cancelBtn.className = 'px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';
  cancelBtn.textContent = 'Cancel';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
submitBtn.setAttribute('form', 'product-form');
  submitBtn.id = 'btn-submit';
  submitBtn.className = 'px-4 py-2 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';
  submitBtn.textContent = isEdit ? 'Save Changes' : 'Add Product';

  footer.appendChild(cancelBtn);
  footer.appendChild(submitBtn);

  panel.appendChild(header);
  panel.appendChild(form);
  panel.appendChild(footer);
  backdrop.appendChild(panel);

  if (typeof lucide !== 'undefined') lucide.createIcons();

  return backdrop;
}

function buildInputField({ id, label, type, placeholder, required, value, hint, min, step }) {
  const wrap = document.createElement('div');

  const labelEl = document.createElement('label');
  labelEl.htmlFor = id;
  labelEl.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';
  labelEl.textContent = label + (required ? '' : ' (optional)');

  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.name = id.replace('field-', '');
  input.placeholder = placeholder;
  input.value = value;
  if (required) input.required = true;
  if (min !== undefined) input.min = min;
  if (step !== undefined) input.step = step;
  input.className = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors';
  input.setAttribute('aria-describedby', `${id}-error ${id}-hint`);

  const hintEl = document.createElement('p');
  hintEl.id = `${id}-hint`;
  hintEl.className = 'text-xs text-gray-400 dark:text-gray-500 mt-1';
  hintEl.textContent = hint;

  const errorEl = document.createElement('p');
  errorEl.id = `${id}-error`;
  errorEl.className = 'text-xs text-red-600 dark:text-red-400 mt-1 hidden';
  errorEl.setAttribute('aria-live', 'polite');
  errorEl.setAttribute('role', 'alert');

  wrap.appendChild(labelEl);
  wrap.appendChild(input);
  wrap.appendChild(hintEl);
  wrap.appendChild(errorEl);

  return wrap;
}
function buildCategoryField(currentValue) {
  const wrap = document.createElement('div');

  const labelEl = document.createElement('label');
  labelEl.htmlFor = 'field-category';
  labelEl.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';
  labelEl.textContent = 'Category';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'field-category';
  input.name = 'category';
  input.placeholder = 'e.g., Electronics';
  input.value = currentValue;
  input.required = true;
  input.setAttribute('list', 'category-datalist');
  input.setAttribute('autocomplete', 'off');
  input.className = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors';
  input.setAttribute('aria-describedby', 'field-category-error field-category-hint');

  // <datalist> provides autocomplete while still allowing free text input
  const datalist = document.createElement('datalist');
  datalist.id = 'category-datalist';

  // Populate with current categories from state
  getCategories().forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    datalist.appendChild(opt);
  });

  const hintEl = document.createElement('p');
  hintEl.id = 'field-category-hint';
  hintEl.className = 'text-xs text-gray-400 dark:text-gray-500 mt-1';
  hintEl.textContent = 'Pick an existing category or type a new one';

  const errorEl = document.createElement('p');
  errorEl.id = 'field-category-error';
  errorEl.className = 'text-xs text-red-600 dark:text-red-400 mt-1 hidden';
  errorEl.setAttribute('aria-live', 'polite');
  errorEl.setAttribute('role', 'alert');

  wrap.appendChild(labelEl);
  wrap.appendChild(input);
  wrap.appendChild(datalist);
  wrap.appendChild(hintEl);
  wrap.appendChild(errorEl);

  return wrap;
}

function buildTextareaField(currentValue) {
  const wrap = document.createElement('div');

  const labelEl = document.createElement('label');
  labelEl.htmlFor = 'field-description';
  labelEl.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';
  labelEl.textContent = 'Description (optional)';

  const textarea = document.createElement('textarea');
  textarea.id = 'field-description';
  textarea.name = 'description';
  textarea.placeholder = 'Describe the product features, specs…';
  textarea.value = currentValue;
  textarea.rows = 4;
  textarea.maxLength = 500;
  textarea.className = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors resize-none';
  textarea.setAttribute('aria-describedby', 'field-description-error field-description-counter');

  const footer = document.createElement('div');
  footer.className = 'flex items-start justify-between mt-1 gap-2';

  const errorEl = document.createElement('p');
  errorEl.id = 'field-description-error';
  errorEl.className = 'text-xs text-red-600 dark:text-red-400 hidden flex-1';
  errorEl.setAttribute('aria-live', 'polite');
  errorEl.setAttribute('role', 'alert');

  const counter = document.createElement('p');
  counter.id = 'field-description-counter';
  counter.className = 'text-xs text-gray-400 dark:text-gray-500 ml-auto tabular-nums shrink-0';
  counter.textContent = `${currentValue.length}/500`;
  counter.setAttribute('aria-live', 'polite');

  textarea.addEventListener('input', () => {
    counter.textContent = `${textarea.value.length}/500`;
    // Turn counter red when over 450 to warn before limit
    counter.classList.toggle('text-red-500', textarea.value.length > 450);
    counter.classList.toggle('text-gray-400', textarea.value.length <= 450);
  });

  footer.appendChild(errorEl);
  footer.appendChild(counter);
  wrap.appendChild(labelEl);
  wrap.appendChild(textarea);
  wrap.appendChild(footer);

  return wrap;
}
export function buildDetailModal(product) {
  const { label, color } = getStockStatus(product.stock);
  const badgeClass = BADGE_CLASSES[color];

  const backdrop = document.createElement('div');
  backdrop.id = 'detail-modal';
  backdrop.className = 'fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'detail-modal-title');

  const panel = document.createElement('div');
  panel.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto';

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700';

  const title = document.createElement('h2');
  title.id = 'detail-modal-title';
  title.className = 'text-base font-semibold text-gray-900 dark:text-white pr-4 leading-snug';
  title.textContent = product.name;

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.id = 'btn-close-detail';
  closeBtn.className = 'shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';
  closeBtn.setAttribute('aria-label', 'Close details');
  const closeIcon = document.createElement('i');
  closeIcon.setAttribute('data-lucide', 'x');
  closeIcon.className = 'w-4 h-4';
  closeBtn.appendChild(closeIcon);

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Body
  const body = document.createElement('div');
  body.className = 'px-6 py-5 space-y-5';

  const badgeEl = document.createElement('span');
  badgeEl.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`;
  badgeEl.textContent = label;
  body.appendChild(badgeEl);

  const grid = document.createElement('dl');
  grid.className = 'grid grid-cols-2 gap-x-6 gap-y-4';

  [
    { label: 'Category', value: product.category },
    { label: 'Price',    value: formatCurrency(product.price) },
    { label: 'Stock',    value: String(product.stock) + ' units' },
    {
      label: 'Added',
      value: new Date(product.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
    },
  ].forEach(({ label: lbl, value }) => {
    const dt = document.createElement('dt');
    dt.className = 'text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5';
    dt.textContent = lbl;

    const dd = document.createElement('dd');
    dd.className = 'text-sm font-semibold text-gray-900 dark:text-white';
    dd.textContent = value;

    const cell = document.createElement('div');
    cell.appendChild(dt);
    cell.appendChild(dd);
    grid.appendChild(cell);
  });

  body.appendChild(grid);

  if (product.description) {
    const divider = document.createElement('hr');
    divider.className = 'border-gray-100 dark:border-gray-700';
    body.appendChild(divider);

    const descLabel = document.createElement('p');
    descLabel.className = 'text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5';
    descLabel.textContent = 'Description';

    const descText = document.createElement('p');
    descText.className = 'text-sm text-gray-700 dark:text-gray-300 leading-relaxed';
    descText.textContent = product.description; // textContent — XSS safe

    body.appendChild(descLabel);
    body.appendChild(descText);
  }

  // Footer
  const footer = document.createElement('div');
  footer.className = 'px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 js-delete-product';
  deleteBtn.setAttribute('data-id', product.id);
  deleteBtn.setAttribute('aria-label', `Delete ${product.name}`);
  const delIcon = document.createElement('i');
  delIcon.setAttribute('data-lucide', 'trash-2');
  delIcon.className = 'w-4 h-4';
  deleteBtn.appendChild(delIcon);
  deleteBtn.appendChild(document.createTextNode('\u00a0Delete'));

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 js-edit-product';
  editBtn.setAttribute('data-id', product.id);
  editBtn.setAttribute('aria-label', `Edit ${product.name}`);
  const editIcon = document.createElement('i');
  editIcon.setAttribute('data-lucide', 'pencil');
  editIcon.className = 'w-4 h-4';
  editBtn.appendChild(editIcon);
  editBtn.appendChild(document.createTextNode('\u00a0Edit'));

  footer.appendChild(deleteBtn);
  footer.appendChild(editBtn);

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);
  backdrop.appendChild(panel);

  if (typeof lucide !== 'undefined') lucide.createIcons();

  return backdrop;
}

export function buildConfirmModal(productId, productName) {
  const backdrop = document.createElement('div');
  backdrop.id = 'confirm-modal';
  backdrop.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
  backdrop.setAttribute('role', 'alertdialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'confirm-title');
  backdrop.setAttribute('aria-describedby', 'confirm-desc');

  const panel = document.createElement('div');
  panel.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4';
  const icon = document.createElement('i');
  icon.setAttribute('data-lucide', 'trash-2');
  icon.className = 'w-6 h-6 text-red-600 dark:text-red-400';
  iconWrap.appendChild(icon);

  const title = document.createElement('h3');
  title.id = 'confirm-title';
  title.className = 'text-center text-lg font-semibold text-gray-900 dark:text-white mb-2';
  title.textContent = 'Delete Product?';

  const desc = document.createElement('p');
  desc.id = 'confirm-desc';
  desc.className = 'text-center text-sm text-gray-500 dark:text-gray-400 mb-6';
  desc.textContent = `"${productName}" will be permanently removed. This cannot be undone.`;

  const actions = document.createElement('div');
  actions.className = 'flex gap-3';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.id = 'btn-confirm-cancel';
  cancelBtn.className = 'flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500';
  cancelBtn.textContent = 'Cancel';

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.id = 'btn-confirm-delete';
  confirmBtn.className = 'flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500';
  confirmBtn.setAttribute('data-id', productId);
  confirmBtn.textContent = 'Yes, Delete';

  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);

  panel.appendChild(iconWrap);
  panel.appendChild(title);
  panel.appendChild(desc);
  panel.appendChild(actions);
  backdrop.appendChild(panel);

  if (typeof lucide !== 'undefined') lucide.createIcons();

  return backdrop;
}
export function setFieldError(fieldId, errorMsg) {
  const input   = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (!input || !errorEl) return;

  if (errorMsg) {
    errorEl.textContent = errorMsg;
    errorEl.classList.remove('hidden');
    input.classList.add('border-red-400', '!ring-red-400');
    input.classList.remove('border-gray-200', 'dark:border-gray-600');
    input.setAttribute('aria-invalid', 'true');
  } else {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
    input.classList.remove('border-red-400', '!ring-red-400');
    input.classList.add('border-gray-200', 'dark:border-gray-600');
    input.removeAttribute('aria-invalid');
  }
}
export function readFormValues() {
  return {
    name:        document.getElementById('field-name')?.value        ?? '',
    category:    document.getElementById('field-category')?.value    ?? '',
    price:       document.getElementById('field-price')?.value       ?? '',
    stock:       document.getElementById('field-stock')?.value       ?? '',
    description: document.getElementById('field-description')?.value ?? '',
  };
}
