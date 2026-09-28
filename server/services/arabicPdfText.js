import ArabicReshaper from 'arabic-reshaper';

// pdfkit has no built-in text shaping or bidi support, and Arabic script needs both:
//   1. Shaping — Arabic letters change glyph shape depending on their neighbors
//      (isolated/initial/medial/final forms), so raw Unicode letters drawn one by
//      one render as disconnected, wrong-looking shapes.
//   2. Bidi — Arabic reads right-to-left, but numbers/Latin text embedded in an
//      Arabic sentence (a SKU, "ISO 13485", a price) still read left-to-right.
// This module does a deliberately narrow, tested version of both — good enough for
// short labels and wrapped paragraphs in a generated PDF, not a full ICU-grade bidi
// implementation. Verified by rendering real product-sheet text and visually
// inspecting the output (mixed Arabic/Latin lines, SKUs, prices, certifications).

const ARABIC_LETTER_RE = /[؀-ۿݐ-ݿ]/;
const STRONG_RE = /[A-Za-z0-9؀-ۿݐ-ݿ]/;
// Arabic block + Presentation Forms A/B — the ranges our embedded Arabic font
// actually covers. Punctuation shared with Latin (colon, period, parens, digits)
// is deliberately routed to the Latin font below: this font's Arabic-only subset
// is missing glyphs for some of that punctuation (verified: ':' has no glyph),
// so drawing it with the Latin font avoids missing-glyph boxes.
const ARABIC_GLYPH_RE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;

function isArabicChar(ch) {
  return ARABIC_LETTER_RE.test(ch);
}
function isStrong(ch) {
  return STRONG_RE.test(ch);
}

/**
 * Splits one line of mixed Arabic/Latin/number text into runs in VISUAL
 * (left-to-right draw) order. Arabic runs are reshaped into joined presentation
 * forms and internally reversed so pdfkit's left-to-right draw produces the
 * correct glyph order; run ORDER is then reversed to reflect that the paragraph
 * as a whole reads right-to-left. Neutral characters (spaces, punctuation)
 * attach to whichever run they sit inside rather than forcing a split, so
 * "56.00 ر.س" and "ISO 13485" don't get chopped into single characters.
 */
function shapeBidiRuns(text) {
  const runs = [];
  let current = '';
  let currentIsArabic = null;
  for (const ch of text) {
    if (!isStrong(ch)) {
      current += ch;
      continue;
    }
    const arabic = isArabicChar(ch);
    if (currentIsArabic === null || arabic === currentIsArabic) {
      current += ch;
      currentIsArabic = arabic;
    } else {
      runs.push({ text: current, arabic: currentIsArabic });
      current = ch;
      currentIsArabic = arabic;
    }
  }
  if (current) runs.push({ text: current, arabic: currentIsArabic ?? false });

  const processed = runs.map((r) => ({
    text: r.arabic ? ArabicReshaper.convertArabic(r.text).split('').reverse().join('') : r.text,
    arabic: r.arabic,
  }));
  return processed.reverse();
}

/** Re-splits an already-shaped run by actual glyph coverage, for font selection only. */
function splitForFont(text) {
  const subs = [];
  let cur = '';
  let curArabic = null;
  for (const ch of text) {
    const arabic = ARABIC_GLYPH_RE.test(ch);
    if (curArabic === null || arabic === curArabic) {
      cur += ch;
      curArabic = arabic;
    } else {
      subs.push({ text: cur, arabic: curArabic });
      cur = ch;
      curArabic = arabic;
    }
  }
  if (cur) subs.push({ text: cur, arabic: curArabic ?? false });
  return subs;
}

/**
 * Creates a right-to-left line drawer bound to a pdfkit document and its
 * registered Arabic/Latin font names. Handles per-character font switching
 * (so a missing glyph in one font doesn't produce a blank box) and per-font
 * baseline alignment (different fonts have very different ascent metrics —
 * drawing them at the same nominal y otherwise visibly mis-aligns the text).
 */
export function createArabicLineDrawer(doc, { arabicFont, latinFont, rightEdge }) {
  function ascentPts(fontName, fontSize) {
    doc.font(fontName);
    return (doc._font.ascender / (doc._font.unitsPerEm || 1000)) * fontSize;
  }
  function descentPts(fontName, fontSize) {
    doc.font(fontName);
    return Math.max(0, (-doc._font.descender / (doc._font.unitsPerEm || 1000)) * fontSize);
  }

  function lineWidth(text, fontSize) {
    const runs = shapeBidiRuns(text).flatMap((r) => splitForFont(r.text));
    doc.fontSize(fontSize);
    let total = 0;
    for (const r of runs) {
      doc.font(r.arabic ? arabicFont : latinFont);
      total += doc.widthOfString(r.text);
    }
    return total;
  }

  /** Draws one right-aligned line at `topY`; returns the y just below it. */
  function drawLine(text, topY, fontSize) {
    const runs = shapeBidiRuns(text).flatMap((r) => splitForFont(r.text));
    doc.fontSize(fontSize);
    const arAscent = ascentPts(arabicFont, fontSize);
    const latAscent = ascentPts(latinFont, fontSize);
    const baseline = topY + Math.max(arAscent, latAscent);

    let totalWidth = 0;
    for (const r of runs) {
      doc.font(r.arabic ? arabicFont : latinFont);
      totalWidth += doc.widthOfString(r.text);
    }
    let x = rightEdge - totalWidth;
    for (const r of runs) {
      doc.font(r.arabic ? arabicFont : latinFont);
      const y = baseline - (r.arabic ? arAscent : latAscent);
      doc.text(r.text, x, y, { lineBreak: false });
      x += doc.widthOfString(r.text);
    }
    const maxDescent = Math.max(descentPts(arabicFont, fontSize), descentPts(latinFont, fontSize));
    return baseline + maxDescent;
  }

  /**
   * Word-wraps `text` to `maxWidth` and draws it as multiple right-aligned lines
   * starting at `topY`. Arabic words don't join across spaces, so wrapping by
   * word (rather than by character) keeps each line's internal shaping correct.
   * Returns the y just below the last line.
   */
  function drawWrapped(text, topY, fontSize, maxWidth, lineGap = 4) {
    const words = text.split(' ').filter(Boolean);
    const lines = [];
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && lineWidth(candidate, fontSize) > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);

    let y = topY;
    for (const line of lines) {
      y = drawLine(line, y, fontSize) + lineGap;
    }
    return y;
  }

  return { drawLine, drawWrapped, lineWidth };
}
