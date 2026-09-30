import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import prisma from '../lib/prisma.js';

async function main() {
  console.log('--- AUDITING PRODUCT CATEGORIES ---\n');

  try {
    // 1. Fetch all categories
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });

    console.log('Existing Categories:');
    console.table(
      categories.map((c) => ({
        ID: c.id,
        Name: c.name,
        Description: c.description || 'N/A',
      }))
    );

    // 2. Find "Medical Consumables" category
    const consumableCategory = categories.find(
      (c) => c.name.toLowerCase() === 'medical consumables'
    );

    if (!consumableCategory) {
      console.error('\nError: Category "Medical Consumables" not found.');
      return;
    }

    console.log(
      `\nFetching products assigned to "${consumableCategory.name}" (ID: ${consumableCategory.id})...\n`
    );

    // 3. Fetch all products under this category
    const products = await prisma.product.findMany({
      where: { category_id: consumableCategory.id },
      select: {
        id: true,
        sku: true,
        name: true,
        description: true,
        category_id: true,
      },
      orderBy: { id: 'asc' },
    });

    console.log(`Total Products in "${consumableCategory.name}": ${products.length}\n`);

    if (products.length === 0) {
      console.log('No products currently assigned to this category.');
    } else {
      products.forEach((prod, index) => {
        console.log(`[#${index + 1}] ID: ${prod.id} | SKU: ${prod.sku || 'N/A'}`);
        console.log(`    Name:        ${prod.name}`);
        console.log(`    Category ID: ${prod.category_id}`);
        console.log(`    Description: ${prod.description ? prod.description.trim() : 'N/A'}`);
        console.log('------------------------------------------------------------');
      });
    }
  } catch (err) {
    console.error('Database query error:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
