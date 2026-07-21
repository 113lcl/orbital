"use client";

import { useEffect, useRef, useState } from "react";
import ExperienceNav from "../components/ExperienceNav";
import DigitalGravityPlanet from "../components/DigitalGravityPlanet";

export default function ArtifactExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<"drift" | "collapse">("drift");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let width = 0;
    let height = 0;
    let frame = 0;
    const stars = Array.from({ length: 190 }, (_, index) => ({
      x: Math.random(), y: Math.random(), z: Math.random(), size: index % 23 === 0 ? 2.4 : Math.random() * 1.2 + .3,
    }));
    const resize = () => {
      width = window.innerWidth; height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * ratio; canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const render = () => {
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.z -= phase === "collapse" ? .008 : .0018;
        if (star.z <= .02) star.z = 1;
        const scale = 1 / Math.max(star.z, .05);
        const x = (star.x - .5) * width * scale + width / 2;
        const y = (star.y - .5) * height * scale + height / 2;
        context.beginPath();
        context.fillStyle = star.size > 2 ? "#c7ff2f" : `rgba(240,239,231,${Math.min(1,1.1-star.z)})`;
        context.arc(x, y, star.size * scale * .34, 0, Math.PI * 2);
        context.fill();
      });
      frame = requestAnimationFrame(render);
    };
    resize(); render();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, [phase]);

  const move = (event: React.PointerEvent<HTMLElement>) => {
    const x = event.clientX / window.innerWidth - .5;
    const y = event.clientY / window.innerHeight - .5;
    worldRef.current?.style.setProperty("--space-x", `${x * 24}px`);
    worldRef.current?.style.setProperty("--space-y", `${y * 18}px`);
    worldRef.current?.style.setProperty("--space-rx", `${-y * 4}deg`);
    worldRef.current?.style.setProperty("--space-ry", `${x * 5}deg`);
  };

  return (
    <main className={`artifact-world phase-${phase}`} ref={worldRef} onPointerMove={move}>
      <ExperienceNav index="00" label="VISUAL ARTIFACT" />
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="artifact-nebula" aria-hidden="true" />
      <DigitalGravityPlanet collapsed={phase === "collapse"} />
      <div className="artifact-copy">
        <span>OBJECT / OG—01</span>
        <h1>DIGITAL<br /><em>GRAVITY</em></h1>
        <p>Move through the field. Collapse the distance. The image is no longer a cover — it is a coordinate.</p>
      </div>
      <button className="artifact-trigger" type="button" onClick={() => setPhase((value) => value === "drift" ? "collapse" : "drift")}>
        <i /> {phase === "drift" ? "ENGAGE WARP" : "RETURN TO DRIFT"}
      </button>
      <div className="artifact-coordinates">52.2297° N / 21.0122° E<br />DEPTH {phase === "drift" ? "001.6" : "∞"}</div>
    </main>
  );
}
