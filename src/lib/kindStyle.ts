import { nodeKindColors, palette } from "./colors";

const paletteCycle = [
  palette.cyan,
  palette.violet,
  palette.mint,
  palette.gold,
  palette.rose,
  palette.orange,
];

function colorForUnknown(value: string): string {
  let hash = 0;
  for (const ch of value) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return paletteCycle[hash % paletteCycle.length];
}

export function getKindColor(kind: string): string {
  return (
    (nodeKindColors as Record<string, string>)[kind] ?? colorForUnknown(kind)
  );
}

const KIND_ABBREV: Record<string, string> = {
  definition: "Def",
  theorem: "Thm",
  lemma: "Lem",
  proposition: "Prop",
  corollary: "Cor",
  example: "Ex",
  non_example: "Ex",
  counterexample: "C-Ex",
  proof: "Pf",
  proof_step: "Pf",
  proof_method: "Pf",
  axiom: "Ax",
  assumption: "Asm",
  structure: "Str",
  object: "Obj",
  property: "Prop",
  construction: "Con",
  notation: "Not",
  conjecture: "Conj",
  application: "App",
};

/** Short tag shown in a concept node's kind chip. */
export function getKindAbbrev(kind: string): string {
  return KIND_ABBREV[kind] ?? kind.slice(0, 3).replace(/^\w/, (c) => c.toUpperCase());
}

export function getKindTier(kind: string): "primary" | "secondary" | "compact" {
  if (["definition", "theorem", "structure", "object"].includes(kind))
    return "primary";
  if (
    [
      "lemma",
      "proposition",
      "corollary",
      "property",
      "construction",
      "proof",
    ].includes(kind)
  )
    return "secondary";
  return "compact";
}
