import { Search } from "lucide-react";
import { useStore } from "../../store";

/** Inline search affordance in the top bar — opens the command palette. */
export function TopBarSearch() {
  const setPaletteOpen = useStore((s) => s.setPaletteOpen);
  return (
    <button
      type="button"
      onClick={() => setPaletteOpen(true)}
      className="hidden h-10 max-w-[520px] flex-1 items-center gap-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3.5 text-left text-[14px] text-[var(--faint)] transition hover:border-[var(--border-strong)] md:flex"
    >
      <Search className="h-4 w-4 text-[var(--faint)]" />
      <span className="flex-1 truncate">Search concepts, theorems, proofs…</span>
      <kbd className="rounded-[4px] border border-[var(--border)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--faint)]">
        ⌘K
      </kbd>
    </button>
  );
}
