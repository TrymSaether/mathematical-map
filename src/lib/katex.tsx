import katex from "katex";
import { useMemo } from "react";
import "katex/dist/katex.min.css";

type MathTextProps = {
  text: string;
  className?: string;
};

type Token =
  | { kind: "text"; value: string }
  | { kind: "math"; value: string; display: boolean };

/**
 * Render text containing TeX math.
 *
 * Supported delimiters:
 * - Inline:  $...$
 * - Display: $$...$$
 * - Inline:  \(...\)
 * - Display: \[...\]
 *
 * Escaped dollars like \$ are treated as literal text.
 */
export function MathText({ text, className }: MathTextProps) {
  const html = useMemo(() => renderMathInString(text), [text]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Use this for raw JSON values that contain only TeX,
 * for example:
 *
 * {
 *   "mathematicalFormula": "U \\subseteq X \\iff ..."
 * }
 */
export function asInlineMath(value: string): string {
  const s = value.trim();
  if (!s) return "";
  if (hasMathDelimiters(s)) return s;
  return `$${s}$`;
}

/**
 * Use this for raw JSON values that should be displayed as block math.
 */
export function asDisplayMath(value: string): string {
  const s = value.trim();
  if (!s) return "";

  if (s.startsWith("$$") && s.endsWith("$$")) return s;
  if (s.startsWith("\\[") && s.endsWith("\\]")) return s;

  if (s.startsWith("$") && s.endsWith("$") && !s.startsWith("$$")) {
    return `$$${s.slice(1, -1).trim()}$$`;
  }

  if (s.startsWith("\\(") && s.endsWith("\\)")) {
    return `$$${s.slice(2, -2).trim()}$$`;
  }

  return `$$${s}$$`;
}

export function renderMathInString(text: string): string {
  return tokenizeMath(text)
    .map((token) => {
      if (token.kind === "text") return escapeHtml(token.value);
      return renderTeX(token.value, token.display);
    })
    .join("");
}

function renderTeX(src: string, display: boolean): string {
  try {
    return katex.renderToString(src.trim(), {
      displayMode: display,
      throwOnError: false,
      strict: "ignore",
      output: "html",
      trust: false,
    });
  } catch {
    return escapeHtml(src);
  }
}

function tokenizeMath(text: string): Token[] {
  const tokens: Token[] = [];
  let buffer = "";
  let i = 0;

  const flushText = () => {
    if (buffer) {
      tokens.push({ kind: "text", value: buffer });
      buffer = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    // Escaped dollar: \$
    if (ch === "\\" && next === "$") {
      buffer += "$";
      i += 2;
      continue;
    }

    // Display math: $$...$$
    if (ch === "$" && next === "$") {
      const end = findClosingDollarDelimiter(text, i + 2, "$$");

      if (end === -1) {
        buffer += "$$";
        i += 2;
        continue;
      }

      flushText();
      tokens.push({
        kind: "math",
        value: text.slice(i + 2, end),
        display: true,
      });
      i = end + 2;
      continue;
    }

    // Inline math: $...$
    if (ch === "$") {
      const end = findClosingDollarDelimiter(text, i + 1, "$");

      if (end === -1) {
        buffer += "$";
        i += 1;
        continue;
      }

      flushText();
      tokens.push({
        kind: "math",
        value: text.slice(i + 1, end),
        display: false,
      });
      i = end + 1;
      continue;
    }

    // Inline math: \(...\)
    if (ch === "\\" && next === "(") {
      const end = text.indexOf("\\)", i + 2);

      if (end === -1) {
        buffer += "\\(";
        i += 2;
        continue;
      }

      flushText();
      tokens.push({
        kind: "math",
        value: text.slice(i + 2, end),
        display: false,
      });
      i = end + 2;
      continue;
    }

    // Display math: \[...\]
    if (ch === "\\" && next === "[") {
      const end = text.indexOf("\\]", i + 2);

      if (end === -1) {
        buffer += "\\[";
        i += 2;
        continue;
      }

      flushText();
      tokens.push({
        kind: "math",
        value: text.slice(i + 2, end),
        display: true,
      });
      i = end + 2;
      continue;
    }

    buffer += ch;
    i += 1;
  }

  flushText();
  return tokens;
}

function findClosingDollarDelimiter(
  text: string,
  start: number,
  delimiter: "$" | "$$"
): number {
  let i = start;

  while (i < text.length) {
    const idx = text.indexOf(delimiter, i);
    if (idx === -1) return -1;

    if (!isEscaped(text, idx)) {
      return idx;
    }

    i = idx + delimiter.length;
  }

  return -1;
}

function isEscaped(text: string, index: number): boolean {
  let slashCount = 0;
  let i = index - 1;

  while (i >= 0 && text[i] === "\\") {
    slashCount += 1;
    i -= 1;
  }

  return slashCount % 2 === 1;
}

function hasMathDelimiters(s: string): boolean {
  return (
    (s.startsWith("$") && s.endsWith("$")) ||
    (s.startsWith("$$") && s.endsWith("$$")) ||
    (s.startsWith("\\(") && s.endsWith("\\)")) ||
    (s.startsWith("\\[") && s.endsWith("\\]"))
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
