import { uid } from './utils.js';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const SEED_PRODUCTS = [
  {
    id: uid(),
    name: 'Wireless Noise-Cancelling Headphones',
    category: 'Electronics',
    price: 249.99,
    stock: 34,
    description: 'Premium over-ear headphones with 30-hour battery life, active noise cancellation, and foldable design. Compatible with all Bluetooth devices.',
    createdAt: daysAgo(45),
  },
  {
    id: uid(),
    name: 'Mechanical Keyboard — TKL',
    category: 'Electronics',
    price: 129.95,
    stock: 8,   // Low stock
    description: 'Tenkeyless mechanical keyboard with Cherry MX Brown switches, RGB backlight, and PBT double-shot keycaps. USB-C detachable cable.',
    createdAt: daysAgo(30),
  },
  {
    id: uid(),
    name: 'USB-C 65W GaN Charger',
    category: 'Electronics',
    price: 39.99,
    stock: 0,   // Out of stock
    description: 'Compact GaN fast charger. Charges a MacBook Air, iPad, and iPhone simultaneously. Foldable plug, travel-friendly.',
    createdAt: daysAgo(60),
  },
  {
    id: uid(),
    name: 'Ergonomic Mesh Office Chair',
    category: 'Furniture',
    price: 499.00,
    stock: 12,
    description: 'Fully adjustable lumbar support, armrests, seat depth and tilt. Breathable mesh back. BIFMA-certified for 8-hour use.',
    createdAt: daysAgo(90),
  },
  {
    id: uid(),
    name: 'Standing Desk Converter',
    category: 'Furniture',
    price: 189.50,
    stock: 5,   // Low stock
    description: 'Sit-stand converter that fits on any existing desk. Two-tier design for monitor and keyboard. Gas spring lift mechanism.',
    createdAt: daysAgo(20),
  },
  {
    id: uid(),
    name: 'Running Shoes — Men\'s Trail',
    category: 'Apparel',
    price: 119.99,
    stock: 42,
    description: 'Lightweight trail running shoes with Vibram outsole, waterproof membrane, and responsive midsole foam. Available in sizes 7–14.',
    createdAt: daysAgo(15),
  },
  {
    id: uid(),
    name: 'Merino Wool Crew-Neck Sweater',
    category: 'Apparel',
    price: 89.00,
    stock: 3,   // Low stock
    description: '100% fine merino wool. Temperature-regulating, odor-resistant, machine washable on delicate cycle. Slim fit.',
    createdAt: daysAgo(10),
  },
  {
    id: uid(),
    name: 'The Pragmatic Programmer',
    category: 'Books',
    price: 49.95,
    stock: 27,
    description: '20th Anniversary Edition. Classic software engineering book covering topics from DRY principle to career growth. Paperback, 352 pages.',
    createdAt: daysAgo(5),
  },
  {
    id: uid(),
    name: 'Designing Data-Intensive Applications',
    category: 'Books',
    price: 55.00,
    stock: 18,
    description: 'By Martin Kleppmann. In-depth coverage of databases, distributed systems, and data engineering. Hardcover, 616 pages.',
    createdAt: daysAgo(8),
  },
  {
    id: uid(),
    name: 'Whey Protein Isolate — Chocolate',
    category: 'Health & Fitness',
    price: 64.99,
    stock: 0,   // Out of stock
    description: '5 lb bag. 25g protein per serving, 2g carbs, <1g fat. Instantized for easy mixing. No artificial flavors or colors.',
    createdAt: daysAgo(3),
  },
  {
    id: uid(),
    name: 'Resistance Band Set (5 levels)',
    category: 'Health & Fitness',
    price: 24.99,
    stock: 61,
    description: 'Set of 5 latex-free resistance bands from 10 to 50 lb. Includes mesh carry bag and exercise guide. Suitable for all fitness levels.',
    createdAt: daysAgo(12),
  },
  {
    id: uid(),
    name: '4K USB-C Monitor 27"',
    category: 'Electronics',
    price: 379.00,
    stock: 9,   // Low stock
    description: '27-inch 4K IPS panel, 60Hz, 99% sRGB, HDR400. Single USB-C cable for power + video + data hub. VESA mount compatible.',
    createdAt: daysAgo(7),
  },
];
