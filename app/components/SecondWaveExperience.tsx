"use client";

import { useEffect, useRef, useState } from "react";
import ExperienceNav from "./ExperienceNav";

type WaveKind = "gravity-loom" | "time-rift" | "signal-garden";

const chapters = [
  ["00:00", "IGNITION", "A thought becomes a signal."],
  ["00:07", "DISTORTION", "The signal refuses a straight line."],
  ["00:19", "CONTACT", "Two unknown systems begin to resonate."],
  ["00:42", "GRAVITY", "Attention changes the shape of the field."],
  ["01:∞", "AFTERLIGHT", "The event ends. Its echo does not."],
] as const;

export default function SecondWaveExperience({ kind }: { kind: WaveKind }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: .5, y: .5, down: false });
  const [phase, setPhase] = useState(0);
  const [planted, setPlanted] = useState(12);
  const [palette, setPalette] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 0, height = 0, frame = 0, tick = 0;
    const shoots = Array.from({ length: planted }, (_, index) => ({
      x: planted <= 1 ? .5 : .05 + (index / (planted - 1)) * .9, height: .15 + Math.random() * .42, lean: (Math.random() - .5) * .12,
      petals: 4 + index % 5, hue: index % 3,
    }));

    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 2); width = innerWidth; height = innerHeight;
      canvas.width = width * ratio; canvas.height = height * ratio; ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const loom = () => {
      const px = pointer.current.x * width, py = pointer.current.y * height;
      const paletteSet = palette % 3;
      const background = ctx.createRadialGradient(px, py, 0, px, py, Math.max(width, height) * .72);
      background.addColorStop(0, paletteSet === 1 ? "#17102e" : paletteSet === 2 ? "#111711" : "#101016");
      background.addColorStop(1, "#030304"); ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
      ctx.lineCap = "round";
      for (let index = 0; index < 74; index++) {
        const baseY = height * (index + .5) / 74;
        const distance = Math.abs(baseY - py);
        const influence = Math.max(0, 1 - distance / Math.max(180, height * .32));
        const pulse = Math.sin(tick * .012 + index * .31) * (7 + influence * 28);
        const pull = (py - baseY) * influence * (pointer.current.down ? .82 : .42);
        const twist = Math.sin(tick * .006 + index * .19 + paletteSet) * influence * width * .065;
        ctx.beginPath(); ctx.moveTo(-40, baseY + pulse * .35);
        ctx.bezierCurveTo(width * .28 + twist, baseY + pulse, px - width * .08, baseY + pull, px, baseY + pull * .92);
        ctx.bezierCurveTo(px + width * .08, baseY + pull, width * .72 - twist, baseY - pulse, width + 40, baseY - pulse * .35);
        const accent = index % 13 === 0;
        ctx.strokeStyle = accent ? (paletteSet === 2 ? "rgba(199,255,47,.9)" : "rgba(126,88,255,.9)") : `rgba(240,239,231,${.055 + influence * .22})`;
        ctx.lineWidth = accent ? 1.5 : .65; ctx.shadowBlur = accent ? 14 : 0; ctx.shadowColor = accent ? (paletteSet === 2 ? "#c7ff2f" : "#7852ff") : "transparent"; ctx.stroke();
      }
      ctx.shadowBlur = 0;
      for (let index = 0; index < 22; index++) {
        const angle = tick * .002 + index * Math.PI * 2 / 22;
        const radius = 58 + index * 7;
        ctx.beginPath(); ctx.fillStyle = index % 5 === 0 ? "#c7ff2f" : "rgba(240,239,231,.45)";
        ctx.arc(px + Math.cos(angle) * radius, py + Math.sin(angle) * radius * .38, index % 5 === 0 ? 2.2 : 1, 0, Math.PI * 2); ctx.fill();
      }
    };

    const garden = () => {
      ctx.fillStyle = "#e8e4d8"; ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(10,10,9,.12)"; ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
      const wind = (pointer.current.x - .5) * .15;
      shoots.forEach((shoot, index) => {
        const baseX = shoot.x * width, baseY = height * .9;
        const growth = Math.min(1, tick / 80 + index * .06);
        const topY = baseY - shoot.height * height * growth;
        const topX = baseX + (shoot.lean + wind) * height * growth;
        ctx.beginPath(); ctx.strokeStyle = "#121211"; ctx.lineWidth = index % 4 === 0 ? 2 : 1;
        ctx.moveTo(baseX, baseY); ctx.quadraticCurveTo(baseX - wind * 180, (baseY + topY) / 2, topX, topY); ctx.stroke();
        const petalColor = shoot.hue === 0 ? "#6b39ff" : shoot.hue === 1 ? "#c7ff2f" : "#ff6148";
        for (let p = 0; p < shoot.petals; p++) {
          const angle = p / shoot.petals * Math.PI * 2 + tick * .002 * (index % 2 ? 1 : -1);
          ctx.save(); ctx.translate(topX, topY); ctx.rotate(angle); ctx.scale(1, .45);
          ctx.beginPath(); ctx.fillStyle = petalColor; ctx.arc(16 * growth, 0, (7 + index % 4) * growth, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
        ctx.beginPath(); ctx.fillStyle = "#111"; ctx.arc(topX, topY, 3.2 * growth, 0, Math.PI * 2); ctx.fill();
      });
    };

    const timeline = () => {
      ctx.fillStyle = "#d7ff39"; ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(9,9,8,.18)";
      for (let x = -height; x < width + height; x += 52) { ctx.beginPath(); ctx.moveTo(x + tick % 52, 0); ctx.lineTo(x - height + tick % 52, height); ctx.stroke(); }
    };

    const render = () => { tick++; kind === "gravity-loom" ? loom() : kind === "signal-garden" ? garden() : timeline(); frame = requestAnimationFrame(render); };
    resize(); render(); window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [kind, palette, planted]);

  const move = (event: React.PointerEvent<HTMLElement>) => {
    pointer.current.x = event.clientX / innerWidth; pointer.current.y = event.clientY / innerHeight;
    event.currentTarget.style.setProperty("--mx", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY}px`);
  };
  const down = (event: React.PointerEvent<HTMLElement>) => {
    pointer.current.down = true; move(event);
    if (kind === "signal-garden") setPlanted((value) => value + 1);
  };
  const wheel = (event: React.WheelEvent<HTMLElement>) => {
    if (kind !== "time-rift") return;
    setPhase((value) => Math.max(0, Math.min(chapters.length - 1, value + (event.deltaY > 0 ? 1 : -1))));
  };

  return (
    <main className={`wave-world wave-${kind}`} onPointerMove={move} onPointerDown={down} onPointerUp={() => { pointer.current.down = false; }} onWheel={wheel}>
      <ExperienceNav index={kind === "gravity-loom" ? "07.1" : kind === "time-rift" ? "07.2" : "07.3"} label={kind.replaceAll("-", " ").toUpperCase()} />
      <canvas ref={canvasRef} aria-label={`${kind.replaceAll("-", " ")} interactive canvas`} />
      {kind === "gravity-loom" && <>
        <div className="wave-copy loom-copy"><span>FIELD STUDY / FILAMENT 01</span><h1>GRAVITY<br /><i>LOOM</i></h1><p>Move through the weave. Hold to pull every filament into your orbit.</p></div>
        <button className="wave-button" onPointerDown={(e) => e.stopPropagation()} onClick={() => setPalette((value) => value + 1)}>REWEAVE FIELD ↗</button>
        <div className="loom-reticle" aria-hidden="true"><i /><b /></div>
        <div className="loom-data"><span>74 FILAMENTS</span><span>TENSION / RESPONSIVE</span><span>TOPOLOGY / {String(palette % 3 + 1).padStart(2, "0")}</span></div>
      </>}
      {kind === "time-rift" && <>
        <div className="rift-counter">0{phase + 1} / 0{chapters.length}</div>
        <div className="rift-stage" style={{ "--rift": phase } as React.CSSProperties}>
          {chapters.map((chapter, index) => <article className={index === phase ? "active" : ""} key={chapter[1]}>
            <span>{chapter[0]}</span><h2>{chapter[1]}</h2><p>{chapter[2]}</p><b>{String(index + 1).padStart(2, "0")}</b>
          </article>)}
        </div>
        <div className="rift-instruction">SCROLL TO FRACTURE TIME ↓</div>
        <div className="rift-nav">{chapters.map((chapter, index) => <button key={chapter[1]} className={phase === index ? "active" : ""} onClick={() => setPhase(index)}>{chapter[0]}</button>)}</div>
      </>}
      {kind === "signal-garden" && <>
        <div className="garden-copy"><span>GENERATIVE SPECIES / {String(planted).padStart(3, "0")}</span><h1>SIGNAL<br />GARDEN</h1><p>Move to change the wind. Click anywhere to grow a new transmission.</p></div>
        <button className="wave-button garden-reset" onPointerDown={(e) => e.stopPropagation()} onClick={() => setPlanted(12)}>RESET GROWTH ↗</button>
      </>}
      <div className="wave-status"><span>ORBITAL EXPERIMENT / 2026</span><span>POINTER INPUT / ACTIVE</span><b>LIVE ●</b></div>
    </main>
  );
}
