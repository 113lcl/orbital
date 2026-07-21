"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const vertexShader = `
  uniform float uTime;
  varying vec3 vObjectPosition;
  varying vec3 vViewNormal;

  void main() {
    vec3 direction = normalize(position);
    float waveA = sin(position.x * 7.0 + position.y * 5.0 + uTime * 0.28);
    float waveB = sin(position.z * 9.0 - position.x * 4.0 - uTime * 0.19);
    float waveC = sin((position.x + position.y - position.z) * 12.0 + uTime * 0.14);
    float displacement = waveA * 0.018 + waveB * 0.012 + waveC * 0.006;
    vec3 transformed = position + direction * displacement;

    vObjectPosition = direction;
    vViewNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec3 vObjectPosition;
  varying vec3 vViewNormal;

  void main() {
    vec3 p = normalize(vObjectPosition);
    float longitude = atan(p.z, p.x);
    float latitude = asin(p.y);

    float warp = sin(latitude * 5.0 + p.x * 3.5 - uTime * 0.11) * 2.2;
    float flowA = sin(longitude * 4.0 + warp + uTime * 0.17);
    float flowB = sin((p.x - p.z) * 11.0 + sin(p.y * 9.0 - uTime * 0.13) * 2.0);
    float flowC = sin((p.x + p.y + p.z) * 18.0 - uTime * 0.08);
    float field = flowA * 0.52 + flowB * 0.34 + flowC * 0.14;

    float folded = abs(sin(field * 2.8 + latitude * 3.0));
    float purpleBand = smoothstep(0.18, 0.88, folded);
    float acidBand = smoothstep(0.72, 0.96, sin(field * 2.15 + longitude * 0.7));
    float cavity = smoothstep(0.28, 0.76, sin(longitude * 3.0 - latitude * 6.0 + flowB));

    vec3 deep = vec3(0.006, 0.005, 0.012);
    vec3 violet = vec3(0.29, 0.07, 0.92);
    vec3 ultraviolet = vec3(0.55, 0.29, 1.0);
    vec3 acid = vec3(0.72, 1.0, 0.04);
    vec3 color = mix(deep, violet, purpleBand * 0.82);
    color = mix(color, ultraviolet, smoothstep(0.72, 0.98, folded) * 0.72);
    color = mix(color, acid, acidBand * (0.58 + folded * 0.42));
    color *= mix(0.28, 1.0, 1.0 - cavity * 0.76);

    float fresnel = pow(1.0 - abs(vViewNormal.z), 2.5);
    color += mix(vec3(0.18, 0.03, 0.62), acid, acidBand) * fresnel * 0.68;
    color += vec3(0.52, 0.35, 1.0) * smoothstep(0.94, 1.0, folded) * 0.5;

    gl_FragColor = vec4(color, 1.0);
  }
`;

type DigitalGravityPlanetProps = {
  collapsed: boolean;
};

export default function DigitalGravityPlanet({ collapsed }: DigitalGravityPlanetProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const collapsedRef = useRef(collapsed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    collapsedRef.current = collapsed;
  }, [collapsed]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.z = 4.45;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.prepend(renderer.domElement);

    const uniforms = { uTime: { value: 0 } };
    const geometry = new THREE.SphereGeometry(1.32, 144, 96);
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const planet = new THREE.Mesh(geometry, material);
    planet.rotation.set(-0.16, -0.42, 0.08);
    scene.add(planet);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.38, 96, 64),
      new THREE.MeshBasicMaterial({ color: 0x6b3cff, transparent: true, opacity: 0.075, side: THREE.BackSide, blending: THREE.AdditiveBlending }),
    );
    planet.add(atmosphere);

    const haloCanvas = document.createElement("canvas");
    haloCanvas.width = 128;
    haloCanvas.height = 128;
    const haloContext = haloCanvas.getContext("2d");
    const haloGradient = haloContext?.createRadialGradient(64, 64, 22, 64, 64, 64);
    haloGradient?.addColorStop(0, "rgba(108,59,255,0.28)");
    haloGradient?.addColorStop(0.58, "rgba(108,59,255,0.12)");
    haloGradient?.addColorStop(1, "rgba(108,59,255,0)");
    if (haloContext && haloGradient) {
      haloContext.fillStyle = haloGradient;
      haloContext.fillRect(0, 0, 128, 128);
    }
    const haloTexture = new THREE.CanvasTexture(haloCanvas);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: haloTexture,
      color: 0x6c3bff,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    halo.scale.set(3.25, 3.25, 1);
    scene.add(halo);

    const drag = { active: false, x: 0, y: 0, velocityX: 0, velocityY: 0 };
    const clock = new THREE.Clock();
    let frame = 0;
    let currentScale = 1;

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
      camera.aspect = Math.max(width, 1) / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const pointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.velocityX = 0;
      drag.velocityY = 0;
      renderer.domElement.setPointerCapture(event.pointerId);
      mount.classList.add("is-grabbing");
    };
    const pointerMove = (event: PointerEvent) => {
      if (!drag.active) return;
      const deltaX = event.clientX - drag.x;
      const deltaY = event.clientY - drag.y;
      planet.rotation.y += deltaX * 0.006;
      planet.rotation.x = THREE.MathUtils.clamp(planet.rotation.x + deltaY * 0.0045, -1.05, 1.05);
      drag.velocityX = deltaX * 0.00075;
      drag.velocityY = deltaY * 0.00055;
      drag.x = event.clientX;
      drag.y = event.clientY;
    };
    const pointerUp = (event: PointerEvent) => {
      drag.active = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
      mount.classList.remove("is-grabbing");
    };

    const render = () => {
      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;
      if (!drag.active) {
        planet.rotation.y += 0.0018 + drag.velocityX;
        planet.rotation.x = THREE.MathUtils.clamp(planet.rotation.x + drag.velocityY, -1.05, 1.05);
        drag.velocityX *= 0.94;
        drag.velocityY *= 0.94;
      }
      planet.rotation.z = Math.sin(elapsed * 0.16) * 0.055;
      const targetScale = collapsedRef.current ? 1.28 : 1;
      currentScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.045);
      planet.scale.setScalar(currentScale);
      halo.scale.setScalar(3.25 * currentScale);
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointercancel", pointerUp);
    resize();
    render();
    window.requestAnimationFrame(() => setReady(true));

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerUp);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      atmosphere.geometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
      (halo.material as THREE.Material).dispose();
      haloTexture.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      className={`gravity-planet ${ready ? "is-ready" : ""}`}
      ref={mountRef}
      data-cursor="ROTATE"
      aria-label="Interactive Digital Gravity planet. Drag to rotate."
      role="img"
    >
      <div className="gravity-planet-fallback" aria-hidden="true" />
      <div className="gravity-orbit gravity-orbit-one" aria-hidden="true"><i /></div>
      <div className="gravity-orbit gravity-orbit-two" aria-hidden="true"><i /></div>
      <span className="gravity-drag-label">DRAG TO ALTER ORBIT</span>
    </div>
  );
}
