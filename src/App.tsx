import { useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { GraphCanvas } from "./components/GraphCanvas";
import { NodePanel } from "./components/NodePanel";
import { CommandPalette } from "./components/CommandPalette";
import { useKeyboardNav } from "./hooks/useKeyboardNav";
import { useStore } from "./store";

export default function App() {
  useKeyboardNav();
  const themeId = useStore((s) => s.themeId);
  const colorMode = useStore((s) => s.colorMode);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = themeId;
    root.dataset.colorMode = colorMode;
  }, [themeId, colorMode]);

  return (
    <div className="atlas-shell flex h-screen w-screen flex-col overflow-hidden">
      <TopBar />
      <div className="atlas-workspace grid min-h-0 flex-1">
        <Sidebar />
        <main className="atlas-main relative min-h-0 overflow-hidden">
          <GraphCanvas />
        </main>
        <NodePanel />
      </div>
      <CommandPalette />
    </div>
  );
}
