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

const SPECIALTIES = [
  // Small specialties first
  { name: 'Mammaplasty', slug: 'mammaplasty' },
  { name: 'Skin Grafting', slug: 'skin-grafting' },
  { name: 'Anaesthesia Instruments', slug: 'anaesthesia' },
  { name: 'Diagnostic', slug: 'diagnostic' },
  { name: 'Dermatology', slug: 'dermatology' },
  { name: 'Podiatry Instruments', slug: 'podiatry-instruments', folder: 'podiatry' },
  { name: 'Post Mortem', slug: 'post-mortem' },
  { name: 'Dressing Instruments', slug: 'dressing-instruments' },
  // Medium specialties
  { name: 'Plastic Surgery', slug: 'plastic-surgery' },
  { name: 'Urology', slug: 'urology' },
  { name: 'Ophthalmic', slug: 'ophthalmic' },
  { name: 'Stomach, Intestine & Rectum', slug: 'stomach-intestine-rectum' },
  { name: 'Neurosurgery / Spine', slug: 'neurosurgery-spine' },
  { name: 'Gynecology & Obstetrics', slug: 'gynecology-obstetrics' },
  // Large specialties
  { name: 'Oral & Maxillofacial', slug: 'oral-maxillofacial' },
  { name: 'Cardiovascular', slug: 'cardiovascular' },
  { name: 'General Surgery', slug: 'general-surgery' },
  { name: 'ENT', slug: 'ent' },
  { name: 'Dental', slug: 'dental' },
  { name: 'Orthopedic', slug: 'orthopedic' }
];

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

async function runSpecialty(spec) {
  console.log(`\n========================================`);
  console.log(`Starting Specialty: ${spec.name} (${spec.slug})`);
  console.log(`========================================`);

  const folder = spec.folder || spec.slug;
  let page = 1;
  let consecutiveEmptyPages = 0;

  while (consecutiveEmptyPages < 1) {
    // Fresh re-read before each page
    const currentCatalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf8'));
    const existingSlugs = new Set(currentCatalogue.map(p => p.slug));

    const pageUrl = page === 1 
      ? `https://xelpovsurgical.com/specialty/${spec.slug}/`
      : `https://xelpovsurgical.com/specialty/${spec.slug}/page/${page}/`;

    console.log(`\n[${spec.name}] Fetching Page ${page}: ${pageUrl}`);
    try {
      const res = await fetch(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });

      if (res.status === 404) {
        console.log(`[${spec.name}] Page ${page} returned 404. End of category.`);
        break;
      }
      if (res.status !== 200) {
        console.warn(`[${spec.name}] Page ${page} returned HTTP ${res.status}. Stopping.`);
        break;
      }

      const html = await res.text();
      const prodLinks = [...html.matchAll(/href="(https:\/\/xelpovsurgical\.com\/product\/[^"\/]+\/)"/gi)].map(m => m[1]);
      const uniqueLinks = [...new Set(prodLinks)];

      if (uniqueLinks.length === 0) {
        console.log(`[${spec.name}] Page ${page} has 0 product links. End of category.`);
        break;
      }

      const todoLinks = uniqueLinks.filter(u => !existingSlugs.has(urlToSlug(u)));
      console.log(`[${spec.name}] Page ${page}: ${uniqueLinks.length} total, ${todoLinks.length} new to scrape`);

      if (todoLinks.length > 0) {
        // Parallel batches of 6
        const BATCH_SIZE = 6;
        for (let i = 0; i < todoLinks.length; i += BATCH_SIZE) {
          const batchUrls = todoLinks.slice(i, i + BATCH_SIZE);
          console.log(`  Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(todoLinks.length / BATCH_SIZE)} (${batchUrls.length} items)...`);

          const promises = batchUrls.map(async (u) => {
            try {
              const prod = await processProduct(u, folder);
              console.log(`    [OK] ${prod.slug} (img: ${prod.images.length})`);
              return prod;
            } catch (err) {
              console.error(`    [FAIL] ${u}:`, err.message);
              return null;
            }
          });

          const results = await Promise.all(promises);
          const validResults = results.filter(Boolean);
          mergeBatchIntoCatalogue(validResults);
        }
      }

      page++;
    } catch (err) {
      console.error(`[${spec.name}] Error on page ${page}:`, err.message);
      break;
    }
  }

  const catNow = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf8'));
  console.log(`[${spec.name}] Finished! Catalogue count now: ${catNow.length}`);
}

async function runRemainingFromSitemaps() {
  console.log(`\n========================================`);
  console.log(`Checking Site-wide Sitemap URLs for any remaining uncategorized products...`);
  console.log(`========================================`);

  const sitemaps = [
    'https://xelpovsurgical.com/product-sitemap.xml',
    'https://xelpovsurgical.com/product-sitemap2.xml',
    'https://xelpovsurgical.com/product-sitemap3.xml',
    'https://xelpovsurgical.com/product-sitemap4.xml'
  ];

  const allUrls = [];
  for (const sm of sitemaps) {
    try {
      const res = await fetch(sm, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      if (res.status === 200) {
        const xml = await res.text();
        const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
        allUrls.push(...urls.filter(u => u.includes('/product/')));
      }
    } catch (e) {
      console.error(`Error loading sitemap ${sm}:`, e.message);
    }
  }

  const uniqueUrls = [...new Set(allUrls)];
  console.log(`Total unique products on site from sitemaps: ${uniqueUrls.length}`);

  const currentCatalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf8'));
  const existingSlugs = new Set(currentCatalogue.map(p => p.slug));

  const remainingUrls = uniqueUrls.filter(u => !existingSlugs.has(urlToSlug(u)));
  console.log(`Remaining products to scrape from sitemaps: ${remainingUrls.length}`);

  if (remainingUrls.length > 0) {
    const BATCH_SIZE = 6;
    for (let i = 0; i < remainingUrls.length; i += BATCH_SIZE) {
      const batchUrls = remainingUrls.slice(i, i + BATCH_SIZE);
      console.log(`  Processing sitemap batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(remainingUrls.length / BATCH_SIZE)} (${batchUrls.length} items)...`);

      const promises = batchUrls.map(async (u) => {
        try {
          const prod = await processProduct(u, 'general');
          console.log(`    [OK] ${prod.slug} (img: ${prod.images.length})`);
          return prod;
        } catch (err) {
          console.error(`    [FAIL] ${u}:`, err.message);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validResults = results.filter(Boolean);
      mergeBatchIntoCatalogue(validResults);
    }
  }

  const finalCatalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf8'));
  console.log(`\n========================================`);
  console.log(`All products imported! Total in catalogue: ${finalCatalogue.length}`);
  console.log(`========================================`);
}

async function main() {
  for (const spec of SPECIALTIES) {
    await runSpecialty(spec);
  }
  await runRemainingFromSitemaps();
}

main().catch(console.error);
