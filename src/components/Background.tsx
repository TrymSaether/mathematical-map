import { useEffect, useRef } from "react";

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function cssNumber(name: string, fallback: number): number {
  const value = Number(cssVar(name));
  return Number.isFinite(value) ? value : fallback;
}

/** Theme-aware atlas background: paper-like in light mode, quiet reading-room dark mode. */
export function Background() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cnv = ref.current!;
    const ctx = cnv.getContext("2d")!;
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cnv.clientWidth;
      h = cnv.clientHeight;
      cnv.width = w * dpr;
      cnv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 0.002;
      ctx.clearRect(0, 0, w, h);

      const primaryRgb = cssVar("--primary-rgb");
      const accentRgb = cssVar("--accent-purple-rgb");
      const transparentRgb = cssVar("--transparent-rgb");
      const primaryGlow = cssNumber("--background-primary-glow", 0.06);
      const accentGlow = cssNumber("--background-accent-glow", 0.03);
      const orbitOpacity = cssNumber("--background-orbit-opacity", 0.024);

      const g = ctx.createRadialGradient(w * 0.5, h * 0.4, 80, w * 0.5, h * 0.4, Math.max(w, h));
      g.addColorStop(0, `rgba(${primaryRgb},${primaryGlow})`);
      g.addColorStop(0.48, `rgba(${accentRgb},${accentGlow})`);
      g.addColorStop(1, `rgba(${transparentRgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 5; i++) {
        const cx = w * 0.48 + Math.cos(t + i) * 26;
        const cy = h * 0.52 + Math.sin(t * 0.8 + i) * 18;
        const radius = 260 + i * 130;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${primaryRgb},${Math.max(orbitOpacity - i * 0.003, 0)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          opacity: "var(--background-grid-opacity)",
          backgroundImage: "radial-gradient(rgba(var(--primary-rgb),0.13) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at center, rgba(var(--mask-rgb),1) 26%, rgba(var(--mask-rgb),0) 82%)",
        }}
      />
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[image:var(--background-vignette)]" />
    </div>
  );
}
