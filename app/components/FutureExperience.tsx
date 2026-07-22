"use client";

import { useEffect, useRef, useState } from "react";
import ExperienceNav from "./ExperienceNav";

type ExperienceKind = "observatory" | "type-engine" | "echo-chamber";

const copy = {
  observatory: {
    index: "06.1", label: "DEEP FIELD OBSERVATORY", eyebrow: "LIVE CELESTIAL INSTRUMENT",
    title: "LOOK\nBEYOND", note: "Move the lens through deep space. Click to lock an unknown object.", action: "LOCK TARGET",
  },
  "type-engine": {
    index: "06.2", label: "KINETIC TYPE ENGINE", eyebrow: "VARIABLE LETTER LABORATORY",
    title: "TYPE\nIS ALIVE", note: "Move horizontally to stretch time. Move vertically to bend the signal.", action: "MUTATE TYPE",
  },
  "echo-chamber": {
    index: "06.3", label: "ECHO CHAMBER", eyebrow: "SPATIAL SIGNAL MEMORY",
    title: "MAKE AN\nECHO", note: "Move to draw a transmission. Click anywhere to release a pressure wave.", action: "RELEASE ECHO",
  },
} as const;

export default function FutureExperience({ kind }: { kind: ExperienceKind }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<HTMLElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const typeGhostRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ x: .5, y: .5, active: false, pulse: 0 });
  const [count, setCount] = useState(0);
  const [variant, setVariant] = useState(0);
  const content = copy[kind];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let width = 0, height = 0, frame = 0, time = 0;
    const stars = Array.from({ length: 240 }, (_, i) => ({
      x: Math.random(), y: Math.random(), z: Math.random(), speed: .15 + Math.random() * .45,
      size: i % 31 === 0 ? 2.7 : .35 + Math.random() * 1.15,
    }));
    const trails: { x: number; y: number; life: number; hue: number }[] = [];

    const resize = () => {
      const ratio = Math.min(devicePixelRatio, 2);
      width = innerWidth; height = innerHeight;
      canvas.width = width * ratio; canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const renderObservatory = () => {
      context.fillStyle = "#050507"; context.fillRect(0, 0, width, height);
      const pointer = pointerRef.current;
      stars.forEach((star, index) => {
        star.z -= .0012 * star.speed;
        if (star.z <= .04) star.z = 1;
        const depth = 1 / Math.max(star.z, .06);
        const drift = time * .00008 * (index % 2 ? 1 : -1);
        const sx = (.5 + (star.x - .5) * depth * .72 + Math.sin(drift + index) * .008) * width;
        const sy = (.5 + (star.y - .5) * depth * .72 + Math.cos(drift + index) * .008) * height;
        const distance = Math.hypot(sx - pointer.x * width, sy - pointer.y * height);
        const focused = pointer.active && distance < 115;
        context.beginPath();
        context.fillStyle = focused ? "#c7ff2f" : index % 9 === 0 ? "#8b6cff" : `rgba(240,239,231,${Math.min(.9, .12 + (1 - star.z) * .8)})`;
        context.arc(sx, sy, star.size * depth * (focused ? 1.8 : .55), 0, Math.PI * 2); context.fill();
      });
      const x = pointer.x * width, y = pointer.y * height;
      context.strokeStyle = "rgba(199,255,47,.6)"; context.lineWidth = 1;
      [48, 82, 116].forEach((radius, index) => { context.beginPath(); context.setLineDash(index === 1 ? [3, 7] : []); context.arc(x, y, radius + Math.sin(time * .02 + index) * 4, 0, Math.PI * 2); context.stroke(); });
      context.setLineDash([]); context.beginPath(); context.moveTo(x - 140, y); context.lineTo(x + 140, y); context.moveTo(x, y - 140); context.lineTo(x, y + 140); context.stroke();
    };

    const renderType = () => {
      const pointer = pointerRef.current;
      context.fillStyle = variant % 2 ? "#d9ff43" : "#e9e6dc"; context.fillRect(0, 0, width, height);
      context.strokeStyle = variant % 2 ? "rgba(10,10,9,.16)" : "rgba(88,60,255,.15)";
      context.lineWidth = 1;
      for (let x = -height; x < width + height; x += 34) { context.beginPath(); context.moveTo(x + time * .08 % 34, 0); context.lineTo(x - height + time * .08 % 34, height); context.stroke(); }
      context.globalCompositeOperation = "multiply";
      const ghostLeft = typeGhostRef.current?.getBoundingClientRect().left ?? width * .76;
      const lineGap = Math.max(14, Math.min(26, width * .015));
      const lineBoundary = Math.max(0, Math.min(width, ghostLeft - lineGap));
      for (let i = 0; i < 9; i++) {
        const y = height * (.16 + i * .095);
        const wave = Math.sin(time * .012 + i * .8) * (16 + pointer.y * 35);
        context.fillStyle = i % 3 === 0 ? "rgba(96,54,255,.34)" : "rgba(12,12,11,.12)";
        context.fillRect(0, y + wave, Math.max(0, lineBoundary - (i % 3) * 5), 2 + (i % 3));
      }
      context.globalCompositeOperation = "source-over";
    };

    const renderEcho = () => {
      context.fillStyle = "rgba(4,7,8,.18)"; context.fillRect(0, 0, width, height);
      const pointer = pointerRef.current;
      trails.unshift({ x: pointer.x * width, y: pointer.y * height, life: 1, hue: time });
      if (trails.length > 92) trails.pop();
      trails.forEach((point, index) => {
        point.life *= .974;
        const radius = index * 5.5 + pointer.pulse * 180;
        context.beginPath();
        context.strokeStyle = index % 4 === 0 ? `rgba(199,255,47,${point.life * .28})` : `rgba(125,88,255,${point.life * .2})`;
        context.lineWidth = index % 11 === 0 ? 2 : 1;
        context.arc(point.x, point.y, radius, 0, Math.PI * 2); context.stroke();
      });
      pointer.pulse *= .94;
      const bands = 34;
      for (let i = 0; i < bands; i++) {
        const x = (i / (bands - 1)) * width;
        const amplitude = 12 + pointer.pulse * 90 + Math.abs(pointer.y - .5) * 42;
        const y = height * .5 + Math.sin(time * .025 + i * .72) * amplitude;
        context.fillStyle = i % 5 === 0 ? "#c7ff2f" : "rgba(240,239,231,.42)";
        context.fillRect(x, y, Math.max(2, width / bands - 6), Math.max(2, Math.abs(y - height * .5) * .28));
      }
    };

    const render = () => {
      time += 1;
      if (kind === "observatory") renderObservatory();
      else if (kind === "type-engine") renderType();
      else renderEcho();
      frame = requestAnimationFrame(render);
    };
    resize(); render(); window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [kind, variant]);

  const move = (event: React.PointerEvent<HTMLElement>) => {
    const x = event.clientX / innerWidth, y = event.clientY / innerHeight;
    pointerRef.current.x = x; pointerRef.current.y = y; pointerRef.current.active = true;
    worldRef.current?.style.setProperty("--future-x", `${x * 100}%`);
    worldRef.current?.style.setProperty("--future-y", `${y * 100}%`);
    worldRef.current?.style.setProperty("--type-stretch", `${.72 + x * .58}`);
    worldRef.current?.style.setProperty("--type-skew", `${(y - .5) * -14}deg`);
    if (readoutRef.current) readoutRef.current.textContent = `X ${Math.round(x * 999).toString().padStart(3, "0")} · Y ${Math.round(y * 999).toString().padStart(3, "0")}`;
  };

  const activate = () => {
    pointerRef.current.pulse = 1;
    setCount((value) => value + 1);
    if (kind === "type-engine") setVariant((value) => value + 1);
  };

  return (
    <main className={`future-world future-${kind}`} ref={worldRef} onPointerMove={move} onPointerDown={activate}>
      <ExperienceNav index={content.index} label={content.label} />
      <canvas ref={canvasRef} aria-label={`${content.label} interactive field`} />
      <div className="future-grid" aria-hidden="true" />
      <div className="future-copy">
        <span>{content.eyebrow}</span>
        <h1>{content.title.split("\n").map((line) => <i key={line}>{line}</i>)}</h1>
        <p>{content.note}</p>
      </div>
      <button className="future-action" type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); activate(); }}><i /> {content.action}</button>
      <div className="future-readout">
        <span>INTERACTIONS / {String(count).padStart(3, "0")}</span>
        <span ref={readoutRef}>X 500 · Y 500</span>
        <b>LIVE / 2026</b>
      </div>
      {kind === "observatory" && <div className="observatory-label">UNCATALOGUED OBJECT<br /><b>ORBIT / VARIABLE</b></div>}
      {kind === "type-engine" && <div className="type-ghost" ref={typeGhostRef} aria-hidden="true">ORBITAL</div>}
      {kind === "echo-chamber" && <div className="echo-ring" aria-hidden="true" />}
    </main>
  );
}
