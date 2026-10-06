import { uid } from './utils.js';
import { SEED_PRODUCTS } from './seed.js';

const STORAGE_KEY = 'pm_dashboard_products';
function readRaw() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function writeRaw(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
export function getAll() {
  try {
    let data = readRaw();
    if (data === null) {
      // First load — seed the store
      writeRaw(SEED_PRODUCTS);
      data = SEED_PRODUCTS;
    }
    return data;
  } catch (err) {
    console.error('[storage] getAll failed:', err);
    throw err; // caller will show toast
  }
}
export function create(fields) {
  try {
    const products = getAll();
    const product = {
      ...fields,
      id: uid(),
      createdAt: new Date().toISOString(),
    };
    writeRaw([...products, product]);
    return product;
  } catch (err) {
    console.error('[storage] create failed:', err);
    throw err;
  }
}
export function update(id, fields) {
  try {
    const products = getAll();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Product ${id} not found`);
    const updated = { ...products[index], ...fields, id, createdAt: products[index].createdAt };
    products[index] = updated;
    writeRaw(products);
    return updated;
  } catch (err) {
    console.error('[storage] update failed:', err);
    throw err;
  }
}
export function remove(id) {
  try {
    const products = getAll();
    writeRaw(products.filter((p) => p.id !== id));
  } catch (err) {
    console.error('[storage] remove failed:', err);
    throw err;
  }
}
export function reset() {
  try {
    writeRaw(SEED_PRODUCTS);
    return SEED_PRODUCTS;
  } catch (err) {
    console.error('[storage] reset failed:', err);
    throw err;
  }
}
