const fs = require('fs');
const path = require('path');
const {
  scrapeSingleProduct,
  downloadAndSaveImages,
  mergeBatchIntoCatalogue,
  getSpecialtyFolder,
  urlToSlug
} = require('./scraper_core.cjs');

const CATALOGUE_PATH = path.resolve('client/public/xelpov_products.json');

async function processProduct(url, folderName) {
  const scraped = await scrapeSingleProduct(url, folderName);
  const folder = getSpecialtyFolder(scraped.specialty, folderName);
  const { primaryImage, allImages } = await downloadAndSaveImages(scraped.slug, scraped.rawImageUrls, folder);

  const product = {
    slug: scraped.slug,
    name: scraped.name,
    specialty: scraped.specialty,
    mainCategory: scraped.mainCategory,
    subCategory: scraped.subCategory,
    specs: scraped.specs,
    description: scraped.description,
    image: primaryImage,
    images: allImages,
    sourceUrl: scraped.sourceUrl
  };
  return product;
}

async function runMicrosurgery() {
  console.log('=== Starting Microsurgery Pages 7-10 ===');

  for (let page = 7; page <= 10; page++) {
    // Fresh re-read before each page
    const currentCatalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf8'));
    const existingSlugs = new Set(currentCatalogue.map(p => p.slug));

    const pageUrl = `https://xelpovsurgical.com/specialty/microsurgery/page/${page}/`;
    console.log(`\n--- Fetching Page ${page}: ${pageUrl} ---`);
    const res = await fetch(pageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    if (res.status !== 200) {
      console.error(`Page ${page} failed with status ${res.status}`);
      continue;
    }
    const html = await res.text();
    const prodLinks = [...html.matchAll(/href="(https:\/\/xelpovsurgical\.com\/product\/[^"\/]+\/)"/gi)].map(m => m[1]);
    const uniqueLinks = [...new Set(prodLinks)];
    const todoLinks = uniqueLinks.filter(u => !existingSlugs.has(urlToSlug(u)));

    console.log(`Page ${page}: ${uniqueLinks.length} products found, ${todoLinks.length} new to process`);

    // Process in batches of 6
    const BATCH_SIZE = 6;
    for (let i = 0; i < todoLinks.length; i += BATCH_SIZE) {
      const batchUrls = todoLinks.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing Page ${page} Batch ${Math.floor(i / BATCH_SIZE) + 1} (${batchUrls.length} items)...`);
      
      const batchResults = [];
      const promises = batchUrls.map(async (u) => {
        try {
          const prod = await processProduct(u, 'microsurgery');
          console.log(`  [OK] ${prod.slug} (Images: ${prod.images.length})`);
          return prod;
        } catch (err) {
          console.error(`  [FAIL] ${u}:`, err.message);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validResults = results.filter(Boolean);

      // Merge immediately after batch
      mergeBatchIntoCatalogue(validResults);
    }
  }

  const finalCatalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf8'));
  console.log(`\n=== Microsurgery Pages 7-10 Complete! Final catalogue count: ${finalCatalogue.length} ===`);
}

runMicrosurgery().catch(console.error);
