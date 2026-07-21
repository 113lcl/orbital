"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type GravitySingularityProps = {
  collapsed: boolean;
};

type Particle = {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  seed: number;
  wobble: number;
  acid: boolean;
  previousX: number;
  previousY: number;
};

type SignalProfile = {
  id: string;
  name: string;
  color: string;
  temperature: string;
  gravity: string;
  orbit: string;
  atmosphere: string;
  status: string;
};

const signalProfiles: SignalProfile[] = [
  { id: "S-01", name: "VANTA IX", color: "#6944ff", temperature: "−184 °C", gravity: "0.82 G", orbit: "112 DAYS", atmosphere: "GLASS VAPOR", status: "DORMANT" },
  { id: "S-02", name: "LIME ECHO", color: "#c7ff2f", temperature: "+41 °C", gravity: "1.16 G", orbit: "029 DAYS", atmosphere: "NEON DUST", status: "CALLING" },
  { id: "S-03", name: "NYX / 07", color: "#ff563d", temperature: "−62 °C", gravity: "2.04 G", orbit: "406 DAYS", atmosphere: "IRON MIST", status: "UNSTABLE" },
  { id: "S-04", name: "PALE MIRROR", color: "#e9e7de", temperature: "−221 °C", gravity: "0.31 G", orbit: "∞ / OPEN", atmosphere: "NONE", status: "LISTENING" },
  { id: "S-05", name: "ULTRA-13", color: "#a46cff", temperature: "+704 °C", gravity: "3.72 G", orbit: "008 HOURS", atmosphere: "PLASMA VEIL", status: "CRITICAL" },
  { id: "S-06", name: "CYAN SLEEP", color: "#65ddff", temperature: "−109 °C", gravity: "0.67 G", orbit: "188 DAYS", atmosphere: "LIQUID SKY", status: "DREAMING" },
  { id: "S-07", name: "EMBER ZERO", color: "#ff8a35", temperature: "+96 °C", gravity: "1.44 G", orbit: "054 DAYS", atmosphere: "CARBON RAIN", status: "AWAKE" },
];

export default function GravitySingularity({ collapsed }: GravitySingularityProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const collapsedRef = useRef(collapsed);
  const [selectedSignal, setSelectedSignal] = useState<SignalProfile | null>(null);

  useEffect(() => {
    collapsedRef.current = collapsed;
  }, [collapsed]);

  useEffect(() => {
    const mount = mountRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!mount || !canvas || !context) return;

    let width = 1;
    let height = 1;
    let frame = 0;
    let particles: Particle[] = [];
    let centerX = 0;
    let centerY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerInside = false;
    let burst = 0;
    let energy = 1;
    let hoveredSignal = -1;
    const startedAt = performance.now();
    const signalNodes = signalProfiles.map((profile, index) => ({
      profile,
      angle: (Math.PI * 2 * index) / signalProfiles.length + index * 0.31,
      orbit: 0.38 + (index % 4) * 0.105,
      speed: 0.0012 + (index % 3) * 0.0005,
      x: 0,
      y: 0,
    }));

    const createParticle = (maxRadius: number, index: number): Particle => ({
      angle: Math.random() * Math.PI * 2,
      radius: maxRadius * (0.16 + Math.random() * 0.88),
      speed: 0.0016 + Math.random() * 0.0044,
      size: index % 29 === 0 ? 2.4 : 0.4 + Math.random() * 1.35,
      seed: Math.random() * 50,
      wobble: 0.18 + Math.random() * 0.44,
      acid: index % 9 === 0 || index % 31 === 0,
      previousX: Number.NaN,
      previousY: Number.NaN,
    });

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      const ratio = Math.min(window.devicePixelRatio, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      centerX = pointerX = width * 0.52;
      centerY = pointerY = height * 0.51;
      const count = width < 700 ? 260 : 520;
      const maxRadius = Math.min(width, height) * 0.48;
      particles = Array.from({ length: count }, (_, index) => createParticle(maxRadius, index));
      context.fillStyle = "#040407";
      context.fillRect(0, 0, width, height);
    };

    const pulse = () => {
      burst = 1;
      mount.classList.remove("is-pulsing");
      void mount.offsetWidth;
      mount.classList.add("is-pulsing");
      window.setTimeout(() => mount.classList.remove("is-pulsing"), 720);
    };

    const pointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      pointerInside = true;
      let nearest = -1;
      let nearestDistance = 22;
      signalNodes.forEach((node, index) => {
        const distance = Math.hypot(pointerX - node.x, pointerY - node.y);
        if (distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      });
      hoveredSignal = nearest;
      mount.dataset.cursor = nearest >= 0 ? "OPEN" : "HOLD";
      mount.classList.toggle("has-signal-hover", nearest >= 0);
    };
    const pointerLeave = () => {
      pointerInside = false;
      hoveredSignal = -1;
      mount.dataset.cursor = "DISTORT";
      mount.classList.remove("has-signal-hover");
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || (event.target instanceof Element && event.target.closest(".signal-card"))) return;
      if (hoveredSignal >= 0) {
        setSelectedSignal(signalNodes[hoveredSignal].profile);
      } else {
        pulse();
      }
    };
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        pulse();
      }
    };

    const drawRings = (x: number, y: number, time: number, coreRadius: number) => {
      context.save();
      context.globalCompositeOperation = "lighter";
      for (let index = 0; index < 7; index += 1) {
        const radius = coreRadius * (1.55 + index * 0.53) + Math.sin(time * 0.8 + index) * 6;
        context.beginPath();
        context.strokeStyle = index % 3 === 0
          ? `rgba(199,255,47,${0.11 - index * 0.009})`
          : `rgba(111,67,255,${0.17 - index * 0.014})`;
        context.lineWidth = index % 2 === 0 ? 1.2 : 0.65;
        context.ellipse(x, y, radius, radius * 0.58, -0.32 + Math.sin(time * 0.12) * 0.06, time * 0.08 + index, time * 0.08 + index + Math.PI * (0.75 + index * 0.08));
        context.stroke();
      }
      context.restore();
    };

    const drawCore = (x: number, y: number, coreRadius: number) => {
      context.save();
      context.globalCompositeOperation = "lighter";
      const aura = context.createRadialGradient(x, y, coreRadius * 0.45, x, y, coreRadius * 2.9);
      aura.addColorStop(0, "rgba(0,0,0,0)");
      aura.addColorStop(0.3, `rgba(112,65,255,${0.31 + burst * 0.18})`);
      aura.addColorStop(0.57, `rgba(199,255,47,${0.08 + burst * 0.12})`);
      aura.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = aura;
      context.beginPath();
      context.arc(x, y, coreRadius * 2.9, 0, Math.PI * 2);
      context.fill();
      context.restore();

      const lens = context.createRadialGradient(x - coreRadius * 0.2, y - coreRadius * 0.22, 0, x, y, coreRadius);
      lens.addColorStop(0, "#111020");
      lens.addColorStop(0.25, "#060609");
      lens.addColorStop(0.72, "#000000");
      lens.addColorStop(0.88, "#18054b");
      lens.addColorStop(0.96, "#9a71ff");
      lens.addColorStop(1, "rgba(199,255,47,.75)");
      context.fillStyle = lens;
      context.shadowColor = "rgba(117,72,255,.8)";
      context.shadowBlur = 34 + burst * 36;
      context.beginPath();
      context.arc(x, y, coreRadius * (1 + burst * 0.12), 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    };

    const drawSignalNodes = (maxRadius: number) => {
      context.save();
      context.textAlign = "center";
      context.font = "600 7px monospace";
      signalNodes.forEach((node, index) => {
        if (!pointerInside) node.angle += node.speed * energy;
        const radius = maxRadius * node.orbit;
        node.x = centerX + Math.cos(node.angle) * radius;
        node.y = centerY + Math.sin(node.angle) * radius * 0.58;
        const active = index === hoveredSignal;

        context.globalCompositeOperation = "lighter";
        context.strokeStyle = active ? "rgba(255,255,255,.9)" : `${node.profile.color}88`;
        context.lineWidth = active ? 1.5 : 0.8;
        context.beginPath();
        context.arc(node.x, node.y, active ? 14 : 9, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = node.profile.color;
        context.shadowColor = node.profile.color;
        context.shadowBlur = active ? 28 : 14;
        context.beginPath();
        context.arc(node.x, node.y, active ? 5.5 : 3.8, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
        context.globalCompositeOperation = "source-over";
        context.fillStyle = active ? "rgba(240,239,231,.95)" : "rgba(156,154,170,.7)";
        context.fillText(active ? node.profile.name : node.profile.id, node.x, node.y - (active ? 20 : 14));
      });
      context.restore();
    };

    const render = (now: number) => {
      const time = (now - startedAt) / 1000;
      const desiredEnergy = collapsedRef.current ? 3.1 : 1;
      energy += (desiredEnergy - energy) * 0.035;
      const idleX = width * 0.52 + Math.sin(time * 0.31) * width * 0.035;
      const idleY = height * 0.51 + Math.cos(time * 0.24) * height * 0.028;
      const desiredX = pointerInside ? centerX : idleX;
      const desiredY = pointerInside ? centerY : idleY;
      centerX += (desiredX - centerX) * (pointerInside ? 0.035 : 0.018);
      centerY += (desiredY - centerY) * (pointerInside ? 0.035 : 0.018);
      burst *= 0.94;

      context.globalCompositeOperation = "source-over";
      context.fillStyle = collapsedRef.current ? "rgba(3,2,8,.115)" : "rgba(3,3,7,.17)";
      context.fillRect(0, 0, width, height);

      const maxRadius = Math.min(width, height) * (collapsedRef.current ? 0.57 : 0.47);
      const coreRadius = Math.min(width, height) * (0.055 + (energy - 1) * 0.006);
      const motionEnergy = pointerInside ? 0 : energy;
      context.save();
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";

      particles.forEach((particle, index) => {
        const pull = 1 + Math.max(0, 1 - particle.radius / maxRadius) * 5.6;
        particle.angle += particle.speed * motionEnergy * pull + burst * (0.018 + index % 4 * 0.002);
        particle.radius -= (0.028 + particle.speed * 2.2) * motionEnergy;
        if (particle.radius < coreRadius * 1.25) {
          particle.radius = maxRadius * (0.82 + Math.random() * 0.22);
          particle.angle += Math.PI * (0.35 + Math.random());
          particle.previousX = Number.NaN;
          particle.previousY = Number.NaN;
        }

        const ripple = Math.sin(particle.angle * 3 + particle.seed + time * particle.wobble) * (11 + particle.radius * 0.035);
        const orbitRadius = particle.radius + ripple;
        const tilt = 0.59 + Math.sin(particle.seed) * 0.08;
        const x = centerX + Math.cos(particle.angle) * orbitRadius + Math.sin(particle.angle * 2.3 + particle.seed) * 18;
        const y = centerY + Math.sin(particle.angle) * orbitRadius * tilt + Math.cos(particle.angle * 2.7 - particle.seed) * 12;
        const fade = Math.min(1, Math.max(0.08, particle.radius / (maxRadius * 0.62)));

        if (Number.isFinite(particle.previousX)) {
          context.beginPath();
          context.strokeStyle = particle.acid
            ? `rgba(199,255,47,${0.16 + fade * 0.34})`
            : `rgba(${index % 5 === 0 ? "165,118,255" : "98,50,255"},${0.12 + fade * 0.3})`;
          context.lineWidth = particle.size * (collapsedRef.current ? 1.25 : 1);
          context.moveTo(particle.previousX, particle.previousY);
          context.lineTo(x, y);
          context.stroke();
        }
        particle.previousX = x;
        particle.previousY = y;
      });
      context.restore();

      drawRings(centerX, centerY, time, coreRadius);
      drawCore(centerX, centerY, coreRadius);
      drawSignalNodes(maxRadius);
      frame = window.requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    mount.addEventListener("pointermove", pointerMove);
    mount.addEventListener("pointerleave", pointerLeave);
    mount.addEventListener("pointerdown", pointerDown);
    mount.addEventListener("keydown", keyDown);
    resize();
    frame = window.requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      mount.removeEventListener("pointermove", pointerMove);
      mount.removeEventListener("pointerleave", pointerLeave);
      mount.removeEventListener("pointerdown", pointerDown);
      mount.removeEventListener("keydown", keyDown);
    };
  }, []);

  return (
    <div
      className="gravity-singularity"
      ref={mountRef}
      data-cursor="DISTORT"
      role="button"
      tabIndex={0}
      aria-label="Interactive gravity singularity. Move to bend the field and click to release a pulse."
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="singularity-reticle" aria-hidden="true"><i /><b /></div>
      <span className="singularity-label">HOVER TO FREEZE · SELECT A SIGNAL</span>
      <span className="singularity-reading">GRAVITY / <b>{collapsed ? "∞" : "06.24"}</b></span>
      {selectedSignal && (
        <aside className="signal-card" role="dialog" aria-label={`${selectedSignal.name} signal data`} onPointerDown={(event) => event.stopPropagation()}>
          <div className="signal-card-top"><span>{selectedSignal.id} / DISCOVERED</span><button type="button" onClick={() => setSelectedSignal(null)} aria-label="Close signal card">×</button></div>
          <div className="signal-card-visual" style={{ "--signal-color": selectedSignal.color } as CSSProperties} aria-hidden="true"><i /><b /></div>
          <div className="signal-card-title"><span>UNKNOWN WORLD</span><h2>{selectedSignal.name}</h2><p>{selectedSignal.status}</p></div>
          <dl>
            <div><dt>TEMPERATURE</dt><dd>{selectedSignal.temperature}</dd></div>
            <div><dt>GRAVITY</dt><dd>{selectedSignal.gravity}</dd></div>
            <div><dt>ORBITAL PERIOD</dt><dd>{selectedSignal.orbit}</dd></div>
            <div><dt>ATMOSPHERE</dt><dd>{selectedSignal.atmosphere}</dd></div>
          </dl>
        </aside>
      )}
    </div>
  );
}
