/**
 * Émoji par catégorie (style PagesJaunes) — partagé entre /annuaire, /categories, etc.
 * Clé = slug de catégorie en base.
 */
export const CATEGORY_EMOJIS: Record<string, string> = {
  'restaurants-alimentation': '🍽️',
  'restaurants': '🍴',
  'hotels': '🏨',
  'tourisme-hotellerie': '✈️',
  'tourisme': '🏖️',
  'sante-bien-etre': '🏥',
  'btp-construction': '🏗️',
  'commerce-distribution': '🛒',
  'immobilier': '🏠',
  'transport-logistique': '🚚',
  'technologie-informatique': '💻',
  'informatiques': '🖥️',
  'genie-logiciel': '👨‍💻',
  'banques': '🏦',
  'assurances-banques': '🏦',
  'services-financiers': '💰',
  'agriculture-agroalimentaire': '🌾',
  'education-formation': '🎓',
  'mode-textile': '👗',
  'mode-accessoires': '👜',
  'barbier-salon-de-coiffure': '💈',
  'sport-loisirs': '⚽',
  'arts-culture': '🎭',
  'electroniques': '📱',
  'telecom': '📡',
  'marketing-communication': '📣',
  'conseil-services': '💼',
  'administration': '🏛️',
  'energie-environnement': '⚡',
  'droite': '⚖️',
  'gestion-des-ressources-humaines': '👥',
};

export const FALLBACK_EMOJI = '🏢';

export function categoryEmoji(slug?: string | null): string {
  return (slug && CATEGORY_EMOJIS[slug]) || FALLBACK_EMOJI;
}
