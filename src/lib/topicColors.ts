/** The 8 Math Atlas domain colors, used to tint topic clusters in the legend. */
export const DOMAIN_COLORS = [
  "#2563eb", // blue
  "#16a34a", // green
  "#7c3aed", // purple
  "#dc2626", // red
  "#0d9488", // teal
  "#f97316", // orange
  "#db2777", // pink
  "#eab308", // gold
] as const;

/** Stable color for a topic cluster, derived from its position in the sorted topic list. */
export function topicColor(topics: string[], topic: string): string {
  const idx = topics.indexOf(topic);
  return DOMAIN_COLORS[(idx < 0 ? 0 : idx) % DOMAIN_COLORS.length];
}
