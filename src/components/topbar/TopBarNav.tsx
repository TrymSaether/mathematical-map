import { Compass, Library, Route, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV: { label: string; icon: LucideIcon; active: boolean }[] = [
  { label: "Atlas", icon: Compass, active: true },
  { label: "Library", icon: Library, active: false },
  { label: "Paths", icon: Route, active: false },
];

/** Primary product navigation — Atlas is the only live surface today. */
export function TopBarNav() {
  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {NAV.map(({ label, icon: Icon, active }) => (
        <button
          key={label}
          type="button"
          aria-current={active ? "page" : undefined}
          className={cn(
            "inline-flex items-center gap-2 rounded-[8px] px-3 py-2 text-[14px] transition",
            active
              ? "bg-[var(--surface-muted)] font-semibold text-[var(--text)]"
              : "font-medium text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-soft)]"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </nav>
  );
}
