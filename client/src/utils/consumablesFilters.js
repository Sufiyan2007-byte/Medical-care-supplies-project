/** Consumables catalogue sections, in display order. */

export const CONSUMABLES_FILTER_KEYS = ['all', '1', '2', '3', '4', '5', '6'];

const SECTION_IDS = new Set(['1', '2', '3', '4', '5', '6']);

export function getConsumableSection(product = {}) {
  const section = String(product.section || '').trim();
  if (SECTION_IDS.has(section)) return section;

  const name = String(product.name || '').toLowerCase();
  if (/\bglove|\bgown\b|face mask/.test(name)) return '1';
  if (/gauze|dressing|tape|swab|mepilex|mepore|mepitel|sponge|bone wax|bandage/.test(name)) return '2';
  if (/endotracheal|airway|ventilat|anesthesia circuit|ambu|laryngeal|nebulizer|suction tube|oxygen/.test(name)) return '3';
  if (/catheter|urine|nasogastric|chest tube|feeding|drainage/.test(name)) return '4';
  if (/syringe|suture|needle|cannula|i\.v\.|intravenous|stop ?cock/.test(name)) return '5';
  return '6';
}

export function compareConsumables(a = {}, b = {}) {
  const sectionDelta = Number(getConsumableSection(a)) - Number(getConsumableSection(b));
  if (sectionDelta) return sectionDelta;
  const orderDelta = (Number(a.order) || 9999) - (Number(b.order) || 9999);
  if (orderDelta) return orderDelta;
  return String(a.name || '').localeCompare(String(b.name || ''));
}
