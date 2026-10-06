const trim = (v) => String(v ?? '').trim();

export const validators = {
  name(value) {
    const v = trim(value);
    if (!v) return 'Product name is required.';
    if (v.length < 2) return 'Name must be at least 2 characters.';
    if (v.length > 80) return 'Name must be 80 characters or fewer.';
    return null;
  },

  category(value) {
    const v = trim(value);
    if (!v) return 'Category is required.';
    if (v.length < 2) return 'Category must be at least 2 characters.';
    if (v.length > 50) return 'Category must be 50 characters or fewer.';
    return null;
  },

  price(value) {
    const v = trim(value);
    if (!v) return 'Price is required.';
    const num = parseFloat(v);
    if (isNaN(num)) return 'Price must be a valid number.';
    if (num <= 0) return 'Price must be greater than 0.';
    // Check max 2 decimal places without floating-point issues
    if (!/^\d+(\.\d{1,2})?$/.test(v)) return 'Price must have at most 2 decimal places.';
    return null;
  },

  stock(value) {
    const v = trim(String(value));
    if (v === '') return 'Stock quantity is required.';
    const num = Number(v);
    if (!Number.isInteger(num)) return 'Stock must be a whole number.';
    if (num < 0) return 'Stock cannot be negative.';
    return null;
  },

  description(value) {
    // Optional field — only validate max length if something was typed
    const v = trim(value);
    if (v.length > 500) return 'Description must be 500 characters or fewer.';
    return null;
  },
};
export function validateAll(fields) {
  const errors = {};
  for (const [field, validate] of Object.entries(validators)) {
    const error = validate(fields[field] ?? '');
    if (error) errors[field] = error;
  }
  return errors;
}
