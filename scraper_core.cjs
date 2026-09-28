const fs = require('fs');
const path = require('path');

const CATALOGUE_PATH = path.resolve('client/public/xelpov_products.json');
const IMAGES_BASE_DIR = path.resolve('client/public/xelpov_images');

const PROTECTED_CATEGORIES = [
  'Stomach, Intestine & Rectum',
  'Knives, Needles & Picks',
  'Dissectors, Elevators & Levers',
  'Files, Saws & Rasps'
];

function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8230;/g, '…')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (m, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (m, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function cleanHtml(text) {
  if (!text) return '';
  let str = text.replace(/<[^>]+>/g, ' ');
  str = decodeHtmlEntities(str);
  return str.replace(/\s+/g, ' ').trim();
}

function splitCommaList(str) {
  if (!str) return [];
  let s = decodeHtmlEntities(str);
  PROTECTED_CATEGORIES.forEach((cat, idx) => {
    s = s.split(cat).join(`__PROT_${idx}__`);
  });
  const parts = s.split(',').map(p => {
    let item = p.trim();
    PROTECTED_CATEGORIES.forEach((cat, idx) => {
      item = item.split(`__PROT_${idx}__`).join(cat);
    });
    return item;
  }).filter(Boolean);
  return parts;
}

function toCamelCase(str) {
  if (/^ce\s*marking$/i.test(str)) return 'ceMarking';
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, chr => chr.toLowerCase());
}

function urlToSlug(url) {
  const parts = url.replace(/\/+$/, '').split('/');
  let raw = decodeURIComponent(parts[parts.length - 1]);
  return raw
    .replace(/½/g, 'half')
    .replace(/¼/g, 'quarter')
    .replace(/¾/g, 'three-quarter')
    .replace(/⌀/g, 'diameter')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getSpecialtyFolder(specialties, defaultFolder = '') {
  const map = {
    'microsurgery': 'microsurgery',
    'plastic-surgery': 'plastic-surgery',
    'urology': 'urology',
    'ophthalmic': 'ophthalmic',
    'stomach-intestine-rectum': 'stomach-intestine-rectum',
    'neurosurgery-spine': 'neurosurgery-spine',
    'neurosurgery': 'neurosurgery-spine',
    'gynecology-obstetrics': 'gynecology-obstetrics',
    'oral-maxillofacial': 'oral-maxillofacial',
    'cardiovascular': 'cardiovascular',
    'general-surgery': 'general-surgery',
    'ent': 'ent',
    'dental': 'dental',
    'orthopedic': 'orthopedic',
    'post-mortem': 'post-mortem',
    'podiatry-instruments': 'podiatry',
    'podiatry': 'podiatry',
    'dermatology': 'dermatology',
    'diagnostic': 'diagnostic',
    'skin-grafting': 'skin-grafting',
    'anaesthesia-instruments': 'anaesthesia',
    'anaesthesia': 'anaesthesia',
    'mammaplasty': 'mammaplasty',
    'dressing-instruments': 'dressing-instruments'
  };
  if (defaultFolder && map[defaultFolder]) return map[defaultFolder];
  for (const s of specialties) {
    const slug = s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (map[slug]) return map[slug];
  }
  return 'general';
}

function paraphraseShortDesc(rawShortDesc, name, specs, specialties, mainCats, subCats) {
  let cleanDesc = cleanHtml(rawShortDesc);

  cleanDesc = cleanDesc
    .replace(/Xelpov(?:'s|’s| Surgical)?/gi, '')
    .replace(/\b(?:We are proud to present|crafted with (?:unparalleled|meticulous) precision|highest quality standards|state-of-the-art|unrivaled|meticulously designed|ideal choice|masterfully designed|engineered to perfection)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  let useCase = '';
  const sentences = cleanDesc.split(/(?<=[.!?])\s+/).filter(Boolean);
  for (const s of sentences) {
    let trimmed = s.trim();
    if (trimmed.length > 15 && !trimmed.toLowerCase().includes('satisfaction') && !trimmed.toLowerCase().includes('warranty')) {
      trimmed = trimmed
        .replace(/^[A-Za-z0-9’'\s\-]+?(?:is\s+a\s+surgical\s+instrument\s+(?:that\s+is\s+)?used\s+to|is\s+used\s+to|used\s+to|is\s+designed\s+to|enables\s+surgeons\s+to|allows\s+surgeons\s+to)\s+/i, 'Designed to ')
        .replace(/^(?:The\s+)?(?:instrument\s+features|features)\s+/i, 'Features ')
        .trim();
      if (!useCase && trimmed.length > 15) {
        useCase = trimmed;
      }
    }
  }

  const specialtyStr = specialties.slice(0, 2).join(' and ');
  const catStr = (subCats[0] || mainCats[0] || 'surgical instrument').toLowerCase();

  let intro = `A professional-grade ${catStr}`;
  if (specs.overallLength) {
    intro = `A ${specs.overallLength} ${catStr}`;
  }
  if (specialtyStr) {
    intro += ` designed for ${specialtyStr} procedures`;
  } else {
    intro += ` designed for surgical procedures`;
  }

  const designFeatures = [];
  if (specs.workingEndDetails) designFeatures.push(`features ${specs.workingEndDetails.toLowerCase()}`);
  if (specs.workingEndProfile) {
    const prof = Array.isArray(specs.workingEndProfile) ? specs.workingEndProfile.join(' or ') : specs.workingEndProfile;
    designFeatures.push(`a ${prof.toLowerCase()} profile`);
  }
  if (specs.handleType) designFeatures.push(`a ${specs.handleType.toLowerCase()} for controlled manipulation`);

  if (designFeatures.length > 0) {
    intro += `, which ${designFeatures.join(' and ')}.`;
  } else {
    intro += '.';
  }

  let clinicalPurpose = '';
  if (useCase) {
    if (!useCase.endsWith('.')) useCase += '.';
    clinicalPurpose = ' ' + useCase;
  }

  let buildInfo = '';
  const mat = specs.material || 'stainless steel';
  const fin = specs.finish ? `with a ${specs.finish.toLowerCase()} finish` : 'satin finish';
  buildInfo = ` Manufactured from ${mat} ${fin}`;
  if (specs.ceMarking && specs.reusable) {
    buildInfo += '; CE marked and fully reusable following standard sterilization.';
  } else if (specs.ceMarking) {
    buildInfo += '; CE marked.';
  } else if (specs.reusable) {
    buildInfo += '; reusable after standard sterilization.';
  } else {
    buildInfo += '.';
  }

  return (intro + clinicalPurpose + ' ' + buildInfo).replace(/\s+/g, ' ').trim();
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          ...(options.headers || {})
        }
      });
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function scrapeSingleProduct(url, currentSpecialtySlug = '') {
  const res = await fetchWithRetry(url);
  if (res.status !== 200) {
    throw new Error(`Failed HTTP ${res.status} for ${url}`);
  }
  const html = await res.text();

  // 1. Title
  const titleMatch = html.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i);
  const name = titleMatch ? cleanHtml(titleMatch[1]) : '';

  // 2. Slug
  const slug = urlToSlug(url);

  // 3. Short description
  const shortDescMatch = html.match(/class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const rawShortDesc = shortDescMatch ? shortDescMatch[1] : '';

  // 4. Spec table
  let specialty = [];
  let mainCategory = [];
  let subCategory = [];
  const specs = {};

  const tableMatch = html.match(/<table[^>]*class="[^"]*woocommerce-product-attributes[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
  if (tableMatch) {
    const rows = [...tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const r of rows) {
      const th = r[1].match(/<th[^>]*>([\s\S]*?)<\/th>/i);
      const td = r[1].match(/<td[^>]*>([\s\S]*?)<\/td>/i);
      if (!th || !td) continue;
      const rawLabel = cleanHtml(th[1]);
      const rawVal = cleanHtml(td[1]);

      if (/^specialt/i.test(rawLabel)) {
        specialty = splitCommaList(rawVal);
      } else if (/^main\s*categor/i.test(rawLabel)) {
        mainCategory = splitCommaList(rawVal);
      } else if (/^sub-?\s*categor/i.test(rawLabel)) {
        subCategory = splitCommaList(rawVal);
      } else {
        const key = toCamelCase(rawLabel);
        if (key === 'ceMarking' || key === 'reusable') {
          specs[key] = /^yes/i.test(rawVal) ? true : rawVal;
        } else if (key === 'workingEndProfile' && rawVal.includes(',')) {
          specs[key] = rawVal.split(',').map(s => s.trim());
        } else {
          specs[key] = rawVal;
        }
      }
    }
  }

  // 5. Gallery Images
  const galleryFigures = [...html.matchAll(/<figure[^>]*class="[^"]*woocommerce-product-gallery__image[^"]*"[^>]*>([\s\S]*?)<\/figure>/gi)];
  const rawImageUrls = [];
  for (const fig of galleryFigures) {
    const dataLarge = fig[1].match(/data-large_image="([^"]+)"/i);
    const aHref = fig[1].match(/<a[^>]*href="([^"]+)"/i);
    const src = fig[1].match(/src="([^"]+)"/i);
    const fullUrl = (dataLarge && dataLarge[1]) || (aHref && aHref[1]) || (src && src[1]);
    if (fullUrl && !rawImageUrls.includes(fullUrl)) {
      rawImageUrls.push(fullUrl);
    }
  }

  if (rawImageUrls.length === 0) {
    const postImgs = [...html.matchAll(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*>/gi)];
    for (const img of postImgs) {
      const dataLarge = img[0].match(/data-large_image="([^"]+)"/i);
      const src = img[0].match(/src="([^"]+)"/i);
      const fullUrl = (dataLarge && dataLarge[1]) || (src && src[1]);
      if (fullUrl && !rawImageUrls.includes(fullUrl)) {
        rawImageUrls.push(fullUrl);
      }
    }
  }

  const validImageUrls = rawImageUrls.filter(u => !u.includes('xelpov-placeholder') && !u.startsWith('data:image/svg'));

  // 6. Paraphrased Description
  const description = paraphraseShortDesc(rawShortDesc, name, specs, specialty, mainCategory, subCategory);

  return {
    slug,
    name,
    specialty,
    mainCategory,
    subCategory,
    specs,
    description,
    sourceUrl: url,
    rawImageUrls: validImageUrls
  };
}

async function downloadAndSaveImages(slug, rawImageUrls, folderName) {
  if (!rawImageUrls || rawImageUrls.length === 0) {
    return { primaryImage: null, allImages: [] };
  }

  const targetDir = path.join(IMAGES_BASE_DIR, folderName);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const savedPaths = [];
  for (let i = 0; i < rawImageUrls.length; i++) {
    const imgUrl = rawImageUrls[i];
    const extMatch = imgUrl.match(/\.(png|jpg|jpeg|webp)(?:\?.*)?$/i);
    const ext = extMatch ? (extMatch[1].toLowerCase() === 'jpeg' ? 'jpg' : extMatch[1].toLowerCase()) : 'png';
    const filename = i === 0 ? `${slug}.${ext}` : `${slug}-${i + 1}.${ext}`;
    const filePath = path.join(targetDir, filename);
    const relPath = `/xelpov_images/${folderName}/${filename}`;

    try {
      const res = await fetchWithRetry(imgUrl);
      if (res.status === 200) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 500) {
          fs.writeFileSync(filePath, buf);
          savedPaths.push(relPath);
        } else {
          console.warn(`  [WARN] Image too small (${buf.length} bytes): ${imgUrl}`);
        }
      } else {
        console.warn(`  [WARN] Image download HTTP ${res.status}: ${imgUrl}`);
      }
    } catch (err) {
      console.error(`  [ERR] Failed downloading ${imgUrl}:`, err.message);
    }
  }

  return {
    primaryImage: savedPaths[0] || null,
    allImages: savedPaths
  };
}

function mergeBatchIntoCatalogue(newProducts) {
  if (newProducts.length === 0) return 0;

  // Fresh re-read of catalogue right before merge
  const currentCatalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf8'));
  const currentSlugs = new Set(currentCatalogue.map(p => p.slug));

  let addedCount = 0;
  for (const item of newProducts) {
    if (!currentSlugs.has(item.slug)) {
      currentCatalogue.push(item);
      currentSlugs.add(item.slug);
      addedCount++;
    } else {
      console.log(`  [COLLISION] Skipped existing slug right before merge: ${item.slug}`);
    }
  }

  if (addedCount > 0) {
    fs.writeFileSync(CATALOGUE_PATH, JSON.stringify(currentCatalogue, null, 2) + '\n', 'utf8');
    console.log(`[MERGED] Successfully added ${addedCount} new products. Total catalogue count: ${currentCatalogue.length}`);
  }
  return addedCount;
}

module.exports = {
  scrapeSingleProduct,
  downloadAndSaveImages,
  mergeBatchIntoCatalogue,
  getSpecialtyFolder,
  decodeHtmlEntities,
  cleanHtml,
  urlToSlug
};
