import { RELATION_LABEL } from "../types";

export interface RelationStyle {
  color: string;
  opacity: number;
  width: number;
  dash?: string;
  label: string;
}

interface BaseStyle {
  color: string;
  width: number;
  opacity: number;
  dash?: string;
}

/**
 * Explicit per-relation style table. Keys are the exact relation strings
 * emitted by the data pipeline (see SOURCE_DEPENDS_ON_TARGET and the
 * edge_types catalogued across the field JSON files).
 */
const RELATION_STYLES: Record<string, BaseStyle> = {
  // Logical dependency — strongest, purple.
  requires:           { color: "var(--purple)", width: 2.2, opacity: 0.58 },
  uses:               { color: "var(--purple)", width: 2.0, opacity: 0.50 },
  assumes:            { color: "var(--purple)", width: 2.0, opacity: 0.50, dash: "6 5" },
  implies:            { color: "var(--purple)", width: 2.2, opacity: 0.62 },
  proves:             { color: "var(--purple)", width: 2.2, opacity: 0.62 },

  // Definitional / notational — blue.
  defines:            { color: "var(--blue)",   width: 2.2, opacity: 0.60 },
  defined_by:         { color: "var(--blue)",   width: 2.0, opacity: 0.54 },
  introduces:         { color: "var(--blue)",   width: 2.0, opacity: 0.50 },

  // Structural — green / teal.
  subtype_of:         { color: "var(--green)",  width: 2.0, opacity: 0.55 },
  generalizes:        { color: "var(--green)",  width: 2.0, opacity: 0.55 },
  equivalent_to:      { color: "var(--green)",  width: 2.1, opacity: 0.58, dash: "1 3" },
  instance_of:        { color: "var(--teal)",   width: 1.9, opacity: 0.50 },
  has_property:       { color: "var(--teal)",   width: 1.9, opacity: 0.48 },
  constructed_from:   { color: "var(--teal)",   width: 2.0, opacity: 0.52 },
  induces:            { color: "var(--teal)",   width: 2.0, opacity: 0.52 },

  // Illustrative — gold, dashed.
  has_example:        { color: "var(--gold)",   width: 1.9, opacity: 0.46, dash: "4 7" },
  has_counterexample: { color: "var(--red)",    width: 1.9, opacity: 0.50, dash: "4 7" },
  applied_to:         { color: "var(--gold)",   width: 1.9, opacity: 0.46 },

  // Constraints / failures — red, dashed.
  violates_assumption:{ color: "var(--red)",    width: 2.0, opacity: 0.55, dash: "8 6" },
  shows_necessity_of: { color: "var(--red)",    width: 2.0, opacity: 0.55, dash: "8 6" },

  // Pedagogical — orange, dotted.
  motivates:          { color: "var(--orange)", width: 1.9, opacity: 0.44, dash: "2 6" },
  prerequisite_for:   { color: "var(--orange)", width: 1.9, opacity: 0.46, dash: "2 6" },
};

const FALLBACK: BaseStyle = { color: "var(--fg-4)", width: 1.6, opacity: 0.42 };

export function getRelationStyle(
  relation: string,
  highlighted = false,
  dimmed = false,
): RelationStyle {
  const style = RELATION_STYLES[relation] ?? FALLBACK;
  return {
    color: style.color,
    opacity: dimmed ? 0.08 : highlighted ? 0.95 : style.opacity,
    width: highlighted ? Math.max(style.width + 1.2, 3.2) : style.width,
    dash: style.dash,
    label: RELATION_LABEL[relation],
  };
}
