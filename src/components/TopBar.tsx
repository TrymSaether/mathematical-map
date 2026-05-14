import { HelpCircle, Settings } from "lucide-react";
import { Panel } from "./ui";
import { BrandMark } from "./topbar/BrandMark";
import { MapSwitcher } from "./topbar/MapSwitcher";
import { TopBarNav } from "./topbar/TopBarNav";
import { TopBarSearch } from "./topbar/TopBarSearch";

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-transparent text-[var(--text-soft)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
    >
      {children}
    </button>
  );
}

export function TopBar() {
  return (
    <Panel as="header" className="mb-4 flex h-16 w-full items-center gap-4 px-4">
      <BrandMark />
      <TopBarNav />
      <TopBarSearch />
      <div className="ml-auto flex items-center gap-1.5">
        <MapSwitcher />
        <IconButton label="Help">
          <HelpCircle className="h-[18px] w-[18px]" />
        </IconButton>
        <IconButton label="Settings">
          <Settings className="h-[18px] w-[18px]" />
        </IconButton>
        <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--purple-200)] bg-[var(--purple-50)] text-[13px] font-semibold text-[var(--purple)]">
          MA
        </div>
      </div>
    </Panel>
  );
}
