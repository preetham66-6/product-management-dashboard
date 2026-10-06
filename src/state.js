let _products = [];   
let _search   = '';
let _category = '';   
let _sort     = '';   
export function setProducts(products) { _products = products; }
export function setSearch(value)      { _search   = value.toLowerCase(); }
export function setCategory(value)    { _category = value; }
export function setSort(value)        { _sort     = value; }
export function getSearch()   { return _search; }
export function getCategory() { return _category; }
export function getSort()     { return _sort; }
export function getCategories() {
  return [...new Set(_products.map((p) => p.category))].sort();
}
export function getDerivedProducts() {
  let list = [..._products];

if (_search) {
    list = list.filter((p) => p.name.toLowerCase().includes(_search));
  }

  if (_category) {
    list = list.filter((p) => p.category === _category);
  }
  if (_sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
  if (_sort === 'price-desc') list.sort((a, b) => b.price - a.price);

  return list;
}
export function getSummary() {
  const total      = _products.length;
  const totalValue = _products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStock   = _products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = _products.filter((p) => p.stock === 0).length;
  return { total, totalValue, lowStock, outOfStock };
}
export function getById(id) {
  return _products.find((p) => p.id === id) ?? null;
}
export function hasActiveFilters() {
  return _search !== '' || _category !== '' || _sort !== '';
}
