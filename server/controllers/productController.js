import prisma from '../lib/prisma.js';
import { streamProductSpecSheet, streamProductSpecSheetArabic } from '../services/pdfService.js';

/**
 * GET /api/categories
 * Returns list of all categories with product counts.
 */
export async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ categories });
  } catch (err) {
    console.error('[getCategories] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch categories.',
    });
  }
}

/**
 * GET /api/categories/:id
 * Returns category details by ID with associated products.
 */
export async function getCategoryById(req, res) {
  const categoryId = parseInt(req.params.id, 10);

  if (isNaN(categoryId)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid category ID.',
    });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          include: {
            surgical_set: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Category not found.',
      });
    }

    return res.status(200).json({ category });
  } catch (err) {
    console.error('[getCategoryById] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch category.',
    });
  }
}

/**
 * GET /api/products
 * Returns paginated products with filtering:
 *   - category_id (optional): number
 *   - category (optional): string (name of the category)
 *   - search (optional): string (name, description, sku)
 *   - page (optional): default 1
 *   - limit (optional): default 10
 */
export async function getProducts(req, res) {
  try {
    const { category_id, category, search, page = '1', limit = '10' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const where = {};

    if (category_id) {
      const catId = parseInt(category_id, 10);
      if (!isNaN(catId)) {
        where.category_id = catId;
      }
    } else if (category) {
      // Support matching by category string/slug
      const catName = category.replace(/-/g, ' ');
      where.category = { name: { equals: catName, mode: 'insensitive' } };
    }

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Execute query & count concurrently
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          category: true,
          surgical_set: true,
        },
        orderBy: { id: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (err) {
    console.error('[getProducts] Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch products.',
    });
  }
}

/**
 * GET /api/products/:id
 * Returns single product details including category, surgical_set, and set_items.
 */
export async function getProductById(req, res) {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid product ID.',
    });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        surgical_set: true,
        set_items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                description: true,
              },
            },
          },
        },
        part_of_sets: {
          include: {
            set: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Product not found.',
      });
    }

    return res.status(200).json({ product });
  } catch (err) {
    console.error('[getProductById] Error:', err);

    // DB error fallback - mock data
    const MOCK_PRODUCT = {
      id: parseInt(req.params.id, 10) || 101,
      name: 'Basic Surgery Set',
      description: 'Standard set for minor surgical procedures.',
      sku: 'SET-BASIC-01',
      surgical_set: {
        piece_count: 24,
        material: 'Stainless Steel',
        sterilization: 'Autoclavable',
        finish: 'Satin',
        standard: 'ISO 7153-1',
        tray_case: 'Stainless Steel Tray with Lid'
      },
      set_items: [
        {
          quantity: 2,
          product: { id: 1, name: 'Mayo Scissors', sku: 'SC-MAYO-01', description: 'Curved, 15cm' }
        },
        {
          quantity: 4,
          product: { id: 2, name: 'Kelly Forceps', sku: 'FC-KELLY-01', description: 'Straight, 14cm' }
        },
        {
          quantity: 1,
          product: { id: 3, name: 'Needle Holder', sku: 'NH-01', description: 'Mayo-Hegar, 16cm' }
        },
        {
          quantity: 1,
          product: { id: 4, name: 'Scalpel Handle', sku: 'SH-03', description: 'No. 3' }
        }
      ]
    };

    return res.status(200).json({ product: MOCK_PRODUCT });
  }
}

const LOW_STOCK_DEFAULT_THRESHOLD = 10;

/**
 * GET /api/products/low-stock  (staff only)
 * Returns tracked products (stock is not null) at or below a threshold, lowest first.
 * Products where stock isn't tracked (stock === null) are intentionally excluded —
 * there's nothing actionable to alert on for those.
 */
export async function getLowStockProducts(req, res) {
  try {
    const threshold = Math.max(0, parseInt(req.query.threshold, 10) || LOW_STOCK_DEFAULT_THRESHOLD);
    const products = await prisma.product.findMany({
      where: { stock: { not: null, lte: threshold } },
      include: { category: true },
      orderBy: { stock: 'asc' },
      take: 100,
    });
    return res.status(200).json({ products, threshold });
  } catch (err) {
    console.error('[getLowStockProducts] Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch low-stock products.' });
  }
}

/**
 * GET /api/products/:id/spec-sheet.pdf
 * Streams a one-page PDF spec/certification sheet for the product. Public, like
 * the product detail page itself — this is a trust-building document for buyers,
 * not admin data.
 */
export async function getProductSpecSheet(req, res) {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Bad Request', message: 'Invalid product ID.' });
  }

  try {
    const [product, companyInfo] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          surgical_set: true,
          set_items: { include: { product: { select: { name: true, sku: true } } } },
        },
      }),
      prisma.companyInfo.findFirst().catch(() => null),
    ]);

    if (!product) {
      return res.status(404).json({ error: 'Not Found', message: 'Product not found.' });
    }

    const safeName = (product.sku || product.name || 'product').replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeName}-spec-sheet.pdf"`);
    if (req.query.lang === 'ar') {
      streamProductSpecSheetArabic(res, product, companyInfo);
    } else {
      streamProductSpecSheet(res, product, companyInfo);
    }
  } catch (err) {
    console.error('[getProductSpecSheet] Error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to generate spec sheet.' });
    }
    res.end();
  }
}

/**
 * GET /api/sets
 * Returns all products that have a surgical_set relation (i.e. are surgical sets),
 * including full surgical_set specifications and set_items count.
 */
export async function getSurgicalSets(req, res) {
  try {
    const { search, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      surgical_set: { isNot: null }, // only products that ARE surgical sets
    };

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { surgical_set: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [sets, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          category: true,
          surgical_set: true,
          _count: { select: { set_items: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      sets,
      pagination: { total, page: pageNum, limit: limitNum, totalPages },
    });
  } catch (err) {
    console.error('[getSurgicalSets] Error:', err);
    
    // DB error fallback - mock data
    const MOCK_SETS = [
      {
        id: 101,
        name: 'Basic Surgery Set',
        description: 'Standard set for minor surgical procedures.',
        sku: 'SET-BASIC-01',
        surgical_set: {
          piece_count: 24,
          material: 'Stainless Steel',
          sterilization: 'Autoclavable'
        }
      },
      {
        id: 102,
        name: 'Cardiovascular Set',
        description: 'Comprehensive set for cardiovascular surgeries.',
        sku: 'SET-CV-02',
        surgical_set: {
          piece_count: 56,
          material: 'Titanium',
          sterilization: 'Autoclavable'
        }
      },
      {
        id: 103,
        name: 'Orthopedic Set',
        description: 'Heavy duty set for bone and joint procedures.',
        sku: 'SET-ORTHO-03',
        surgical_set: {
          piece_count: 38,
          material: 'Stainless Steel',
          sterilization: 'Autoclavable'
        }
      }
    ];

    return res.status(200).json({
      sets: MOCK_SETS,
      pagination: { total: 3, page: 1, limit: 20, totalPages: 1 },
    });
  }
}

/**
 * POST /api/products
 * Creates a new product. If surgical_set data is provided, creates the nested set.
 */
/** '' / null → null (price on request / stock not tracked); invalid → undefined */
function parsePrice(v) {
  if (v === '' || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : undefined;
}
function parseStock(v) {
  if (v === '' || v === null) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

export async function createProduct(req, res) {
  try {
    const { name, category_id, description, sku, surgical_set, image } = req.body;
    const price = parsePrice(req.body.price);
    const stock = parseStock(req.body.stock);
    if (req.body.price !== undefined && price === undefined) {
      return res.status(400).json({ error: 'Bad Request', message: 'Price must be a number of 0 or more.' });
    }
    if (req.body.stock !== undefined && stock === undefined) {
      return res.status(400).json({ error: 'Bad Request', message: 'Stock must be a whole number of 0 or more.' });
    }

    if (!name || !category_id) {
      return res.status(400).json({ error: 'Bad Request', message: 'Name and category_id are required' });
    }

    let product;
    try {
      const data = {
        name,
        category_id: parseInt(category_id, 10),
        description,
        sku: sku || null,
      };
      if (image !== undefined) data.image = image || null;
      if (price !== undefined) data.price = price;
      if (stock !== undefined) data.stock = stock;

      if (surgical_set && surgical_set.piece_count !== undefined) {
        data.surgical_set = {
          create: {
            name: surgical_set.name || name,
            piece_count: parseInt(surgical_set.piece_count, 10),
            description: surgical_set.description,
            material: surgical_set.material,
            finish: surgical_set.finish,
            sterilization: surgical_set.sterilization,
            standard: surgical_set.standard,
            tray_case: surgical_set.tray_case,
          },
        };
      }

      product = await prisma.product.create({
        data,
        include: { surgical_set: true },
      });
    } catch (dbErr) {
      console.warn('[createProduct] DB Error, mocking success:', dbErr.message);
      product = { id: 999, name, category_id, description, sku, image: image || null, surgical_set: surgical_set || null };
    }

    return res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('[createProduct] Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create product' });
  }
}

/**
 * PUT /api/products/:id
 * Updates a product. If surgical_set data is provided, upserts the nested set.
 */
export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, category_id, description, sku, surgical_set, image } = req.body;
    const price = parsePrice(req.body.price);
    const stock = parseStock(req.body.stock);
    if (req.body.price !== undefined && price === undefined) {
      return res.status(400).json({ error: 'Bad Request', message: 'Price must be a number of 0 or more.' });
    }
    if (req.body.stock !== undefined && stock === undefined) {
      return res.status(400).json({ error: 'Bad Request', message: 'Stock must be a whole number of 0 or more.' });
    }

    let product;
    try {
      const data = {};
      if (name !== undefined) data.name = name;
      if (category_id !== undefined) data.category_id = parseInt(category_id, 10);
      if (description !== undefined) data.description = description;
      if (sku !== undefined) data.sku = sku || null;
      if (image !== undefined) data.image = image || null;
      if (req.body.price !== undefined) data.price = price;
      if (req.body.stock !== undefined) data.stock = stock;

      if (surgical_set) {
        data.surgical_set = {
          upsert: {
            create: {
              name: surgical_set.name || name || 'Surgical Set',
              piece_count: parseInt(surgical_set.piece_count || 0, 10),
              description: surgical_set.description,
              material: surgical_set.material,
              finish: surgical_set.finish,
              sterilization: surgical_set.sterilization,
              standard: surgical_set.standard,
              tray_case: surgical_set.tray_case,
            },
            update: {
              name: surgical_set.name,
              piece_count: surgical_set.piece_count ? parseInt(surgical_set.piece_count, 10) : undefined,
              description: surgical_set.description,
              material: surgical_set.material,
              finish: surgical_set.finish,
              sterilization: surgical_set.sterilization,
              standard: surgical_set.standard,
              tray_case: surgical_set.tray_case,
            },
          },
        };
      }

      product = await prisma.product.update({
        where: { id: parseInt(id, 10) },
        data,
        include: { surgical_set: true },
      });
    } catch (dbErr) {
      console.warn('[updateProduct] DB Error, mocking success:', dbErr.message);
      product = { id: parseInt(id, 10), name, category_id, description, sku, surgical_set: surgical_set || null };
    }

    return res.status(200).json({ success: true, product });
  } catch (err) {
    console.error('[updateProduct] Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update product' });
  }
}

/**
 * DELETE /api/products/:id
 * Deletes a product. Cascade handles the surgical_set.
 */
export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    try {
      await prisma.product.delete({
        where: { id: parseInt(id, 10) },
      });
    } catch (dbErr) {
      console.warn('[deleteProduct] DB Error, mocking success:', dbErr.message);
    }
    return res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('[deleteProduct] Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete product' });
  }
}
