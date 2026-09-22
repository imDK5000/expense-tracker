/**
 * Map of common Indian lender/vendor names → their primary domain.
 * Used to resolve the Google favicon endpoint URL at EMI creation time.
 * Keys are lowercased for case-insensitive matching.
 */
export const LENDER_MAP: Record<string, string> = {
  'moneyview': 'moneyview.in',
  'bajaj finserv': 'bajajfinserv.in',
  'bajaj': 'bajajfinserv.in',
  'hdfc bank': 'hdfcbank.com',
  'hdfc': 'hdfcbank.com',
  'icici bank': 'icicibank.com',
  'icici': 'icicibank.com',
  'idfc first': 'idfcfirstbank.com',
  'idfc first bank': 'idfcfirstbank.com',
  'idfc': 'idfcfirstbank.com',
  'navi': 'navi.com',
  'kreditbee': 'kreditbee.in',
  'sbi': 'sbi.co.in',
  'state bank of india': 'sbi.co.in',
  'axis bank': 'axisbank.com',
  'axis': 'axisbank.com',
  'kotak': 'kotak.com',
  'kotak mahindra bank': 'kotak.com',
  'tata capital': 'tatacapital.com',
  'tata': 'tatacapital.com',
  'pnb': 'pnbindia.in',
  'punjab national bank': 'pnbindia.in',
  'hero fincorp': 'herofincorp.com',
  'l&t finance': 'ltfs.com',
  'muthoot finance': 'muthootfinance.com',
  'muthoot': 'muthootfinance.com',
  'home credit': 'homecredit.co.in',
  'indusind bank': 'indusind.com',
  'indusind': 'indusind.com',
  'yes bank': 'yesbank.in',
  'yes': 'yesbank.in',
  'federal bank': 'federalbank.co.in',
  'federal': 'federalbank.co.in',
  'early salary': 'earlysalary.com',
  'fibe': 'fibe.in',
  'cashe': 'cashe.co.in',
  'prefr': 'prefr.com',
  'paysense': 'paysense.in',
  'capital float': 'capitalfloat.com',
  'lendingkart': 'lendingkart.com',
  'incred': 'incred.com',
  'stashfin': 'stashfin.com',
  'ring': 'ring.capital',
  'slice': 'sliceit.com',
  'uni cards': 'uni.cards',
}

/**
 * Resolve a lender name to its favicon domain.
 * Returns null if the lender is not in the map.
 */
export function resolveLenderDomain(lenderName: string): string | null {
  const key = lenderName.trim().toLowerCase()
  return LENDER_MAP[key] ?? null
}

/**
 * Get Google favicon URL for a domain.
 */
export function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

/**
 * Generate initials (up to 2 chars) from a lender name.
 */
export function getLenderInitials(lenderName: string): string {
  return lenderName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}
