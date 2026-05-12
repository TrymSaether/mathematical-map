import katex from "katex";
import { useMemo } from "react";

/**
 * Render text with LaTeX delimiters:
 * - Display math: \[...\] or $$...$$
 * - Inline math: \(...\) or $...$
 * Robust against unbalanced delimiters.
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => renderMathInString(text), [text]);
  return (
    <span
      className={className}
      // KaTeX produces trusted HTML from the source text we control.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderTeX(src: string, display: boolean): string {
  try {
    return katex.renderToString(src, {
      displayMode: display,
      throwOnError: false,
      strict: "ignore",
      output: "html",
    });
  } catch {
    return escape(src);
  }
}

export function renderMathInString(text: string): string {
  // Process LaTeX and dollar delimiters
  // Priority: \[...\] > $$...$$ > \(...\) > $...$
  const parts: Array<{ type: "text" | "math"; content: string; display: boolean }> = [];

  let i = 0;
  while (i < text.length) {
    // Find all potential delimiters
    const squareBracket = text.indexOf("\\[", i);
    const doubleDollar = text.indexOf("$$", i);
    const parenDelim = text.indexOf("\\(", i);
    const singleDollar = text.indexOf("$", i);

    // Find the nearest delimiter
    const delimiters = [
      squareBracket >= 0 ? { pos: squareBracket, type: "\\[" } : null,
      doubleDollar >= 0 ? { pos: doubleDollar, type: "$$" } : null,
      parenDelim >= 0 ? { pos: parenDelim, type: "\\(" } : null,
      singleDollar >= 0 ? { pos: singleDollar, type: "$" } : null,
    ].filter((d) => d !== null) as Array<{ pos: number; type: string }>;

    if (delimiters.length === 0) {
      // No more delimiters, add remaining text
      parts.push({ type: "text", content: text.slice(i), display: false });
      break;
    }

    // Sort by position and take the nearest
    delimiters.sort((a, b) => a.pos - b.pos);
    const { pos, type: delim } = delimiters[0];

    // Add text before delimiter
    if (pos > i) {
      parts.push({ type: "text", content: text.slice(i, pos), display: false });
    }

    // Find closing delimiter
    let closeDelim = "";
    let endPos = -1;

    if (delim === "\\[") {
      closeDelim = "\\]";
      endPos = text.indexOf(closeDelim, pos + 2);
      if (endPos !== -1) {
        parts.push({
          type: "math",
          content: text.slice(pos + 2, endPos),
          display: true,
        });
        i = endPos + 2;
      } else {
        parts.push({ type: "text", content: delim, display: false });
        i = pos + 2;
      }
    } else if (delim === "$$") {
      endPos = text.indexOf("$$", pos + 2);
      if (endPos !== -1) {
        parts.push({
          type: "math",
          content: text.slice(pos + 2, endPos),
          display: true,
        });
        i = endPos + 2;
      } else {
        parts.push({ type: "text", content: delim, display: false });
        i = pos + 2;
      }
    } else if (delim === "\\(") {
      closeDelim = "\\)";
      endPos = text.indexOf(closeDelim, pos + 2);
      if (endPos !== -1) {
        parts.push({
          type: "math",
          content: text.slice(pos + 2, endPos),
          display: false,
        });
        i = endPos + 2;
      } else {
        parts.push({ type: "text", content: delim, display: false });
        i = pos + 2;
      }
    } else if (delim === "$") {
      // Make sure it's not a double dollar (already handled)
      if (pos + 1 < text.length && text[pos + 1] === "$") {
        parts.push({ type: "text", content: "$", display: false });
        i = pos + 1;
      } else {
        endPos = text.indexOf("$", pos + 1);
        if (endPos !== -1 && (endPos + 1 >= text.length || text[endPos + 1] !== "$")) {
          parts.push({
            type: "math",
            content: text.slice(pos + 1, endPos),
            display: false,
          });
          i = endPos + 1;
        } else {
          parts.push({ type: "text", content: "$", display: false });
          i = pos + 1;
        }
      }
    }
  }

  // Convert parts to HTML
  return parts
    .map((part) => {
      if (part.type === "text") {
        return escape(part.content);
      } else {
        return renderTeX(part.content, part.display);
      }
    })
    .join("");
}
