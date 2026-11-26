const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2024-09-14' → 'Sep 14, 2024', '2024-09' → 'Sep 2024', '2024' → '2024' */
export function formatDate(date) {
  const [y, m, d] = String(date).split('-').map(Number)
  if (!m) return String(y)
  return d ? `${MONTHS[m - 1]} ${d}, ${y}` : `${MONTHS[m - 1]} ${y}`
}
