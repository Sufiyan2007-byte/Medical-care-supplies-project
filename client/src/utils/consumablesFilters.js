/** Consumables catalogue groups (aligned with server/prisma/seed.js sections). */

const GROUP_1_SKUS = new Set([
  'MC-GLV-LTX-PF',
  '10001217',
  'MC-GLV-VNL-PF',
  '10001200',
]);

const GROUP_2_SKUS = new Set([
  '10001187',
  'MC-TAPE-3M-5CM',
  'MC-SWAB-ALC-200',
  'MC-GAUZE-SWAB-4X4',
  '10001201',
  '10001208',
  '10001202',
  'MC-TAPE-FIX',
  'M23FT',
  'M415FT',
  'MC-DRSG-ALGINATE',
  'MC-DRSG-SILICONE',
  'MC-DRSG-CONTACTMESH',
  'MC-DRSG-CONTACTFILM',
  'MC-DRSG-CONTACTONE',
  'MC-DRSG-FILM',
  'MC-DRSG-WPFILM',
  'MC-DRSG-POSTOP',
  'MC-DRSG-NACLGAUZE',
  '285280',
  'MC-DRSG-AGFOAM',
  'MC-DRSG-BORDER',
  'MC-DRSG-BORDERAG',
  'MC-DRSG-BORDERFLEX',
  'MC-DRSG-BORDERLITE',
  'MC-DRSG-POSTOPBORDER',
  'MC-DRSG-POSTOPBORDERAG',
  'MC-DRSG-SACRUM',
  'MC-DRSG-SACRUMAG',
  'MC-DRSG-HEEL',
  'MC-DRSG-HEELAG',
  'MC-DRSG-LITE',
  'MC-DRSG-TRANSFER',
  'MC-DRSG-TRANSFERAG',
]);

export const CONSUMABLES_FILTER_KEYS = ['all', '1', '2', '3'];

export function getConsumableGroup(sku = '', name = '') {
  const id = String(sku).trim();
  if (GROUP_1_SKUS.has(id)) return '1';
  if (GROUP_2_SKUS.has(id)) return '2';
  if (id && !GROUP_1_SKUS.has(id) && !GROUP_2_SKUS.has(id)) return '3';

  const n = name.toLowerCase();
  if (/\bglove|\bmask\b/.test(n)) return '1';
  if (
    /mepilex|mepore|mepitel|mepiform|mepitac|mefix|micropore|melgisorb|mesalt|gauze|swab|dressing|tape|avant/.test(n)
  ) {
    return '2';
  }
  return '3';
}
