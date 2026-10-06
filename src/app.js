/**
 * app.js — Application entry point and event orchestrator.
 * Imports every other module and wires up all user interactions.
 * This is the only file allowed to import from storage.js AND render.js.
 */
import * as storage from './storage.js';
import * as state   from './state.js';
import * as render  from './render.js';
import { validateAll, validators } from './validation.js';
import { debounce } from './utils.js';

// ─── Initialization ─────────────────────────────────────────────────────────

async function init() {
  // 1. Apply persisted dark-mode preference immediately (before first paint)
  applyTheme(localStorage.getItem('pm_theme') || 'light');

  // 2. Show skeleton while "loading" (simulating async latency)
  render.renderSkeleton();

  await delay(400);

  // 3. Load products from storage
  try {
    const products = storage.getAll();
    state.setProducts(products);
  } catch (err) {
    render.showToast('Failed to load products. Storage may be unavailable.', 'error');
    state.setProducts([]);
  }

  // 4. Render all initial UI
  render.renderSummary();
  render.renderCategoryFilter();
  render.renderProductList();

  // 5. Wire up events
  wireEvents();

  // 6. Set correct sun/moon icon now that the DOM is fully ready
  updateDarkModeIcon(localStorage.getItem('pm_theme') || 'light');
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Global re-render helper ────────────────────────────────────────────────

/**
 * Call after any state mutation that should update the visible list.
 * Summary and category filter also refresh to reflect the latest data.
 */
function refresh(options = {}) {
  render.renderSummary();
  if (options.rebuildFilter) render.renderCategoryFilter();
  render.renderProductList();
}

// ─── Event wiring ───────────────────────────────────────────────────────────

function wireEvents() {
  // Dark mode toggle
  document.getElementById('btn-dark-mode')?.addEventListener('click', () => {
    const current = localStorage.getItem('pm_theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    localStorage.setItem('pm_theme', next);
    updateDarkModeIcon(next);
  });

  // "Add Product" button
  document.getElementById('btn-add-product')?.addEventListener('click', () => openFormModal(null));

  // "Reset demo data" button
  document.getElementById('btn-reset')?.addEventListener('click', handleReset);

  // Search input (debounced)
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      state.setSearch(e.target.value);
      refresh();
    }, 250));
  }

  // Category filter
  document.getElementById('filter-category')?.addEventListener('change', (e) => {
    state.setCategory(e.target.value);
    refresh();
  });

  // Sort select
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    state.setSort(e.target.value);
    refresh();
  });

  // ESC key closes any open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // Delegated click handler for dynamic product actions
  document.addEventListener('click', handleDelegatedClick);
}

// ─── Delegated event handler ────────────────────────────────────────────────

function handleDelegatedClick(e) {
  const viewBtn   = e.target.closest('.js-view-product');
  const editBtn   = e.target.closest('.js-edit-product');
  const deleteBtn = e.target.closest('.js-delete-product');
  const clearBtn  = e.target.closest('#btn-clear-filters');
  const emptyAdd  = e.target.closest('#btn-empty-add');

  if (viewBtn)   openDetailModal(viewBtn.dataset.id);
  if (editBtn)   { closeAllModals(); openFormModal(editBtn.dataset.id); }
  if (deleteBtn) openConfirmModal(deleteBtn.dataset.id);
  if (clearBtn)  clearFilters();
  if (emptyAdd)  openFormModal(null);
}

// ─── Filter controls ────────────────────────────────────────────────────────

function clearFilters() {
  state.setSearch('');
  state.setCategory('');
  state.setSort('');

  const searchInput = document.getElementById('search-input');
  const catFilter   = document.getElementById('filter-category');
  const sortSelect  = document.getElementById('sort-select');
  if (searchInput) searchInput.value = '';
  if (catFilter)   catFilter.value   = '';
  if (sortSelect)  sortSelect.value  = '';

  refresh();
}

// ─── Form Modal ─────────────────────────────────────────────────────────────

function openFormModal(productId) {
  closeAllModals();
  const product = productId ? state.getById(productId) : null;
  const modal   = render.buildFormModal(product);
  document.body.appendChild(modal);

  // Wire form events
  wireFormModal(modal, product);

  // Set initial submit button state — disabled for empty create form,
  // enabled for edit form (which is pre-populated with valid data)
  updateSubmitButton();

  // Trap focus and set initial focus
  trapFocus(modal);
  document.getElementById('field-name')?.focus();

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function wireFormModal(modal, existingProduct) {
  const form = document.getElementById('product-form');
  if (!form) return;

  // Close buttons
  document.getElementById('btn-close-modal')?.addEventListener('click', closeAllModals);
  document.getElementById('btn-cancel-modal')?.addEventListener('click', closeAllModals);

  // Click outside backdrop to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAllModals();
  });

  // Blur + real-time validation
  const FIELD_IDS = ['field-name', 'field-category', 'field-price', 'field-stock', 'field-description'];
  FIELD_IDS.forEach((fieldId) => {
    const input = document.getElementById(fieldId);
    if (!input) return;

    const fieldName = fieldId.replace('field-', '');
    const validate  = validators[fieldName];
    if (!validate) return;

    // Show error when user leaves the field
    input.addEventListener('blur', () => {
      const error = validate(input.value);
      render.setFieldError(fieldId, error);
      updateSubmitButton();
    });

    // On every keystroke: clear the error if now valid, show it if still invalid
    // (only show inline errors on input AFTER the field has been blurred once)
    input.addEventListener('input', () => {
      const errorEl = document.getElementById(`${fieldId}-error`);
      const alreadyShowing = errorEl && !errorEl.classList.contains('hidden');
      const error = validate(input.value);

      // If an error was already showing, update it in real-time
      if (alreadyShowing) {
        render.setFieldError(fieldId, error);
      } else if (!error) {
        // Clear any stale error state even if not blurred yet
        render.setFieldError(fieldId, null);
      }

      updateSubmitButton();
    });
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(existingProduct?.id ?? null);
  });
}

function updateSubmitButton() {
  const btn   = document.getElementById('btn-submit');
  const values = render.readFormValues();
  const errors = validateAll(values);
  if (btn) btn.disabled = Object.keys(errors).length > 0;
}

async function handleFormSubmit(editId) {
  const values = render.readFormValues();
  const errors = validateAll(values);

  // Show all field errors on submit attempt
  ['name', 'category', 'price', 'stock', 'description'].forEach((field) => {
    render.setFieldError(`field-${field}`, errors[field] ?? null);
  });

  if (Object.keys(errors).length > 0) return;

  // Coerce types for storage
  const payload = {
    name:        values.name.trim(),
    category:    values.category.trim(),
    price:       parseFloat(values.price),
    stock:       parseInt(values.stock, 10),
    description: values.description.trim(),
  };

  const submitBtn = document.getElementById('btn-submit');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving…'; }

  try {
    if (editId) {
      const updated = storage.update(editId, payload);
      // Update in-state products list
      const products = storage.getAll();
      state.setProducts(products);
      closeAllModals();
      refresh({ rebuildFilter: true });
      render.showToast(`"${updated.name}" updated successfully.`, 'success');
    } else {
      const created = storage.create(payload);
      const products = storage.getAll();
      state.setProducts(products);
      closeAllModals();
      refresh({ rebuildFilter: true });
      render.showToast(`"${created.name}" added to inventory.`, 'success');
    }
  } catch (err) {
    render.showToast('Failed to save product. Please try again.', 'error');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = editId ? 'Save Changes' : 'Add Product'; }
  }
}

// ─── Detail Modal ───────────────────────────────────────────────────────────

function openDetailModal(productId) {
  const product = state.getById(productId);
  if (!product) return;

  closeAllModals();
  const modal = render.buildDetailModal(product);
  document.body.appendChild(modal);

  // Wire close buttons
  document.getElementById('btn-close-detail')?.addEventListener('click', closeAllModals);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeAllModals(); });

  trapFocus(modal);
  document.getElementById('btn-close-detail')?.focus();

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ─── Confirm Delete Modal ───────────────────────────────────────────────────

function openConfirmModal(productId) {
  const product = state.getById(productId);
  if (!product) return;

  // Don't close detail modal — layer confirm on top (z-50 > z-40)
  const modal = render.buildConfirmModal(productId, product.name);
  document.body.appendChild(modal);

  document.getElementById('btn-confirm-cancel')?.addEventListener('click', () => {
    modal.remove();
  });

  document.getElementById('btn-confirm-delete')?.addEventListener('click', async () => {
    try {
      storage.remove(productId);
      const products = storage.getAll();
      state.setProducts(products);
      closeAllModals(); // also removes detail modal if open
      refresh({ rebuildFilter: true });
      render.showToast(`"${product.name}" has been deleted.`, 'success');
    } catch (err) {
      render.showToast('Failed to delete product. Please try again.', 'error');
      modal.remove();
    }
  });

  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  // Focus confirm delete button for keyboard users
  trapFocus(modal);
  document.getElementById('btn-confirm-delete')?.focus();

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ─── Reset Demo Data ────────────────────────────────────────────────────────

function handleReset() {
  try {
    const products = storage.reset();
    state.setProducts(products);
    // clearFilters calls refresh() which re-renders the list
    clearFilters();
    // Toast after refresh so it appears on top of fresh content
    render.showToast('Demo data has been restored.', 'info');
  } catch (err) {
    render.showToast('Failed to reset data.', 'error');
  }
}

// ─── Modal Utilities ────────────────────────────────────────────────────────

function closeAllModals() {
  ['form-modal', 'detail-modal', 'confirm-modal'].forEach((id) => {
    document.getElementById(id)?.remove();
  });
}

/**
 * Trap keyboard focus inside a modal for accessibility.
 * Collects all focusable elements and cycles Tab/Shift+Tab within them.
 */
function trapFocus(element) {
  const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';
  const focusable = [...element.querySelectorAll(FOCUSABLE)];
  if (!focusable.length) return;

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  element.addEventListener('keydown', handler);

  // Auto-remove listener when modal is removed from DOM
  const observer = new MutationObserver(() => {
    if (!document.contains(element)) {
      element.removeEventListener('keydown', handler);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: false });
}

// ─── Dark Mode ──────────────────────────────────────────────────────────────

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  // updateDarkModeIcon is a no-op before DOM is ready — called again after wireEvents
  updateDarkModeIcon(theme);
}

function updateDarkModeIcon(theme) {
  const icon = document.querySelector('#btn-dark-mode [data-lucide]');
  if (!icon) return; // not in DOM yet — safe to ignore
  icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', init);
