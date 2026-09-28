import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The Xelpov surgical-instrument catalogue is served straight from this static
// JSON file (no database table for it), so the admin panel reads/writes it in place.
const DATA_PATH = path.join(__dirname, '../../client/public/xelpov_products.json');

let cache = null; // in-memory copy of the parsed array, refreshed on read/write

async function loadAll() {
  if (cache) return cache;
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  cache = JSON.parse(raw);
  return cache;
}

async function saveAll(list) {
  // Write to a temp file first, then rename, so a crash mid-write never
  // corrupts the live catalogue that the storefront reads from.
  const tmpPath = `${DATA_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(list, null, 2), 'utf-8');
  await fs.rename(tmpPath, DATA_PATH);
  cache = list;
}

function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueSlug(base, list, ignoreSlug) {
  let slug = base || 'product';
  let n = 2;
  const taken = new Set(list.filter((p) => p.slug !== ignoreSlug).map((p) => p.slug));
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

/**
 * GET /api/xelpov/products
 * Paginated, searchable, filterable list for the admin panel.
 * Query: page, limit, search, specialty, mainCategory
 */
export async function listXelpovProducts(req, res) {
  try {
    const all = await loadAll();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.search || '').trim().toLowerCase();
    const specialty = (req.query.specialty || '').trim();
    const mainCategory = (req.query.mainCategory || '').trim();

    let filtered = all;
    if (search) {
      filtered = filtered.filter(
        (p) => p.name?.toLowerCase().includes(search) || p.slug?.toLowerCase().includes(search)
      );
    }
    if (specialty) {
      filtered = filtered.filter((p) => Array.isArray(p.specialty) && p.specialty.includes(specialty));
    }
    if (mainCategory) {
      filtered = filtered.filter((p) => Array.isArray(p.mainCategory) && p.mainCategory.includes(mainCategory));
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    res.json({
      products: items,
      pagination: { page, limit, total, totalPages },
    });
  } catch (err) {
    console.error('[listXelpovProducts]', err.message);
    res.status(500).json({ message: 'Could not load the catalogue.' });
  }
}

/** GET /api/xelpov/meta — distinct specialties/categories, for filter dropdowns. */
export async function getXelpovMeta(req, res) {
  try {
    const all = await loadAll();
    const specialties = new Set();
    const mainCategories = new Set();
    for (const p of all) {
      (p.specialty || []).forEach((s) => specialties.add(s));
      (p.mainCategory || []).forEach((c) => mainCategories.add(c));
    }
    res.json({
      specialties: [...specialties].sort(),
      mainCategories: [...mainCategories].sort(),
      total: all.length,
    });
  } catch (err) {
    console.error('[getXelpovMeta]', err.message);
    res.status(500).json({ message: 'Could not load catalogue metadata.' });
  }
}

/** GET /api/xelpov/products/:slug */
export async function getXelpovProduct(req, res) {
  try {
    const all = await loadAll();
    const product = all.find((p) => p.slug === req.params.slug);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product });
  } catch (err) {
    console.error('[getXelpovProduct]', err.message);
    res.status(500).json({ message: 'Could not load the product.' });
  }
}

/** POST /api/xelpov/products — staff only */
export async function createXelpovProduct(req, res) {
  try {
    const all = await loadAll();
    const { name, description, image, specialty, mainCategory, subCategory, onRequest, amount } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Product name is required.' });
    }
    const slug = uniqueSlug(slugify(name), all);
    const product = {
      slug,
      name: String(name).trim(),
      description: description || '',
      image: image || '',
      specialty: Array.isArray(specialty) ? specialty : [],
      mainCategory: Array.isArray(mainCategory) ? mainCategory : [],
      subCategory: Array.isArray(subCategory) ? subCategory : [],
      price: { amount: amount ?? null, currency: 'USD', onRequest: onRequest !== false },
      specs: {},
    };
    all.push(product);
    await saveAll(all);
    res.status(201).json({ product });
  } catch (err) {
    console.error('[createXelpovProduct]', err.message);
    res.status(500).json({ message: 'Could not create the product.' });
  }
}

/** PUT /api/xelpov/products/:slug — staff only */
export async function updateXelpovProduct(req, res) {
  try {
    const all = await loadAll();
    const idx = all.findIndex((p) => p.slug === req.params.slug);
    if (idx === -1) return res.status(404).json({ message: 'Product not found.' });

    const current = all[idx];
    const { name, description, image, specialty, mainCategory, subCategory, onRequest, amount } = req.body || {};

    const updated = {
      ...current,
      name: name !== undefined ? String(name).trim() : current.name,
      description: description !== undefined ? description : current.description,
      image: image !== undefined ? image : current.image,
      specialty: Array.isArray(specialty) ? specialty : current.specialty,
      mainCategory: Array.isArray(mainCategory) ? mainCategory : current.mainCategory,
      subCategory: Array.isArray(subCategory) ? subCategory : current.subCategory,
      price: {
        ...current.price,
        onRequest: onRequest !== undefined ? Boolean(onRequest) : current.price?.onRequest,
        amount: amount !== undefined ? amount : current.price?.amount,
      },
    };
    all[idx] = updated;
    await saveAll(all);
    res.json({ product: updated });
  } catch (err) {
    console.error('[updateXelpovProduct]', err.message);
    res.status(500).json({ message: 'Could not update the product.' });
  }
}

/** DELETE /api/xelpov/products/:slug — staff only */
export async function deleteXelpovProduct(req, res) {
  try {
    const all = await loadAll();
    const idx = all.findIndex((p) => p.slug === req.params.slug);
    if (idx === -1) return res.status(404).json({ message: 'Product not found.' });
    all.splice(idx, 1);
    await saveAll(all);
    res.json({ ok: true });
  } catch (err) {
    console.error('[deleteXelpovProduct]', err.message);
    res.status(500).json({ message: 'Could not delete the product.' });
  }
}
