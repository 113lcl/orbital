"use client";

import { useEffect, useRef, useState } from "react";

const projects = [
  { no: "01", title: "NEON / OBJECT", type: "Identity + Digital", year: "2026", hue: "lime" },
  { no: "02", title: "FLUID SIGNAL", type: "Experience + Motion", year: "2026", hue: "violet" },
  { no: "03", title: "AFTERLIGHT", type: "Strategy + Product", year: "2025", hue: "coral" },
  { no: "04", title: "SONIC / BLOOM", type: "AI + Interactive", year: "2025", hue: "cyan" },
];

const services = [
  { no: "01", title: "BRAND SYSTEMS", detail: "Стратегия, позиционирование и визуальный язык, который узнают без логотипа.", tags: "STRATEGY / IDENTITY / VOICE" },
  { no: "02", title: "DIGITAL WORLDS", detail: "Сайты и продукты, где технология становится частью истории, а не просто оболочкой.", tags: "WEB / PRODUCT / CREATIVE DEV" },
  { no: "03", title: "MOTION MATTER", detail: "Кинетическая типографика, 3D и motion-системы, превращающие внимание в эмоцию.", tags: "MOTION / 3D / INTERACTION" },
  { no: "04", title: "FUTURE SIGNALS", detail: "Эксперименты с AI и новыми интерфейсами для брендов, которым тесно в настоящем.", tags: "AI / R&D / INSTALLATIONS" },
];

const archive = ["TOKYO TYPE", "SUBZERO", "LOST SIGNAL", "MARS/01", "NIGHTSHIFT", "KINETIC FM"];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [time, setTime] = useState(0);
  const [labMode, setLabMode] = useState<"attract" | "repel" | "vortex">("attract");
  const [activeService, setActiveService] = useState(0);
  const [mood, setMood] = useState<"ultraviolet" | "solar" | "infra">("ultraviolet");
  const [archiveProgress, setArchiveProgress] = useState(0);
  const orbRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const labModeRef = useRef(labMode);
  const archiveDrag = useRef({ active: false, startX: 0, scrollLeft: 0 });

  useEffect(() => { labModeRef.current = labMode; }, [labMode]);

  useEffect(() => {
    const intro = window.setTimeout(() => setLoaded(true), 220);
    const clock = window.setInterval(() => setTime((value) => value + 1), 1000);
    const move = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
      document.documentElement.style.setProperty("--my", `${event.clientY}px`);
      if (orbRef.current) {
        const x = (event.clientX / window.innerWidth - 0.5) * 20;
        const y = (event.clientY / window.innerHeight - 0.5) * 20;
        orbRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${x * 0.4}deg)`;
      }
    };
    const scroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty("--scroll", `${max > 0 ? (window.scrollY / max) * 100 : 0}%`);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in-view"));
    }, { threshold: 0.16 });
    document.querySelectorAll(".scroll-reveal").forEach((element) => observer.observe(element));
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.clearTimeout(intro);
      window.clearInterval(clock);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    const pointer = { x: -9999, y: -9999 };
    const particles = Array.from({ length: 92 }, (_, index) => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      radius: index % 13 === 0 ? 3.2 : Math.random() * 1.8 + .7,
    }));
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio, 2);
      width = rect.width; height = rect.height;
      canvas.width = width * ratio; canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top;
    };
    const leave = () => { pointer.x = -9999; pointer.y = -9999; };
    const render = () => {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        const px = particle.x * width;
        const py = particle.y * height;
        const dx = pointer.x - px;
        const dy = pointer.y - py;
        const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 35);
        const activeMode = labModeRef.current;
        if (distance < 240) {
          const falloff = 1 - distance / 240;
          if (activeMode === "vortex") {
            const spin = falloff * .048;
            particle.vx += (-dy / distance) * spin + (dx / distance) * .006;
            particle.vy += (dx / distance) * spin + (dy / distance) * .006;
          } else {
            const force = falloff * (activeMode === "attract" ? 0.026 : -0.045);
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;
          }
        }
        particle.vx *= .988; particle.vy *= .988;
        particle.x += particle.vx / Math.max(width, 1);
        particle.y += particle.vy / Math.max(height, 1);
        if (particle.x < 0 || particle.x > 1) particle.vx *= -1;
        if (particle.y < 0 || particle.y > 1) particle.vy *= -1;
        particle.x = Math.max(0, Math.min(1, particle.x));
        particle.y = Math.max(0, Math.min(1, particle.y));
        context.beginPath();
        context.fillStyle = index % 7 === 0 ? "#c7ff2f" : index % 3 === 0 ? "#8b6cff" : "rgba(240,239,231,.72)";
        context.arc(particle.x * width, particle.y * height, particle.radius, 0, Math.PI * 2);
        context.fill();
        particles.slice(index + 1, index + 7).forEach((other) => {
          const ox = other.x * width; const oy = other.y * height;
          const lineDistance = Math.hypot(ox - particle.x * width, oy - particle.y * height);
          if (lineDistance < 95) {
            context.beginPath();
            context.strokeStyle = `rgba(199,255,47,${(1 - lineDistance / 95) * .16})`;
            context.moveTo(particle.x * width, particle.y * height); context.lineTo(ox, oy); context.stroke();
          }
        });
      });
      frame = requestAnimationFrame(render);
    };
    resize(); render();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, []);

  const beginArchiveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const track = archiveRef.current;
    if (!track) return;
    archiveDrag.current = { active: true, startX: event.clientX, scrollLeft: track.scrollLeft };
    track.classList.add("is-dragging");
    track.setPointerCapture(event.pointerId);
    document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
    document.documentElement.style.setProperty("--my", `${event.clientY}px`);
  };

  const moveArchiveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
    document.documentElement.style.setProperty("--my", `${event.clientY}px`);
    if (!archiveDrag.current.active || !archiveRef.current) return;
    archiveRef.current.scrollLeft = archiveDrag.current.scrollLeft - (event.clientX - archiveDrag.current.startX) * 1.35;
  };

  const endArchiveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    archiveDrag.current.active = false;
    archiveRef.current?.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const syncArchiveProgress = () => {
    const track = archiveRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setArchiveProgress(max > 0 ? track.scrollLeft / max : 0);
  };

  const scrubArchive = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = archiveRef.current;
    if (!track) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    track.scrollLeft = ratio * (track.scrollWidth - track.clientWidth);
    document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
    document.documentElement.style.setProperty("--my", `${event.clientY}px`);
    syncArchiveProgress();
  };

  const scrollToWork = () => document.querySelector("#work")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className={`${loaded ? "site is-loaded" : "site"} mood-${mood}`}>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-glow" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true"><span>MOVE</span></div>
      <div className="grain" aria-hidden="true" />

      <header className="nav">
        <a className="brand" href="#top" aria-label="Orbital, на главную">
          <span className="brand-mark">O/</span>
          <span>ORBITAL<br />SYSTEMS</span>
        </a>
        <div className="nav-status">
          <i /> IN MOTION · 20{26 + Math.floor(time / 31536000)}
        </div>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
          <span>{menuOpen ? "CLOSE" : "INDEX"}</span>
          <b>{menuOpen ? "×" : "+"}</b>
        </button>
      </header>

      <div className={`menu-panel ${menuOpen ? "is-open" : ""}`}>
        <nav>
          <a href="#work" onClick={() => setMenuOpen(false)}><span>01</span> Selected work</a>
          <a href="#about" onClick={() => setMenuOpen(false)}><span>02</span> Our signal</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}><span>03</span> Contact</a>
        </nav>
        <p>WARSAW · PARIS · EVERYWHERE<br />AVAILABLE FOR SELECTED MISSIONS</p>
      </div>

      <section className="hero" id="top">
        <div className="hero-kicker reveal">INDEPENDENT CREATIVE LAB / EST. 2026</div>
        <h1 className="hero-title" aria-label="We create digital gravity">
          <span className="line"><em>WE</em> CREATE</span>
          <span className="line line-two">DIGITAL <i>✦</i></span>
          <span className="line outline">GRAVITY</span>
        </h1>
        <div className="orb-wrap reveal" ref={orbRef} aria-hidden="true">
          <div className="orb"><div className="orb-core" /></div>
          <span className="orbit-label">DRAG YOUR REALITY · DRAG YOUR REALITY ·</span>
        </div>
        <div className="hero-bottom reveal">
          <p>СТРАТЕГИЯ, ДИЗАЙН И ТЕХНОЛОГИИ<br />ДЛЯ БРЕНДОВ, КОТОРЫЕ НЕ БОЯТСЯ<br />ПРИТЯГИВАТЬ ВНИМАНИЕ.</p>
          <button className="round-button magnetic" onClick={scrollToWork} aria-label="Смотреть проекты">
            <span>EXPLORE<br />THE ORBIT</span><b>↓</b>
          </button>
          <div className="coordinates">52.2297° N<br />21.0122° E</div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div><span>IDEAS IN MOTION</span> ✦ <span>DESIGNED TO DISTURB</span> ✦ <span>IDEAS IN MOTION</span> ✦ <span>DESIGNED TO DISTURB</span> ✦</div>
      </div>

      <section className="lab scroll-reveal" id="lab">
        <div className="lab-head">
          <span>( 01 — INTERACTION LAB )</span>
          <p>Проведите курсором через поле.<br />Выберите закон цифровой физики.</p>
        </div>
        <div className={`lab-stage mode-${labMode}`}>
          <canvas ref={canvasRef} aria-label="Интерактивное поле частиц" />
          <div className="lab-title"><span>TOUCH THE</span><strong>SIGNAL</strong></div>
          <div className="lab-controls" role="group" aria-label="Режим движения частиц">
            {(["attract", "repel", "vortex"] as const).map((mode) => (
              <button key={mode} onClick={() => setLabMode(mode)} className={labMode === mode ? "active" : ""}>
                <i /> {mode.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="lab-reading"><span>FIELD / {labMode.toUpperCase()}</span><b>{String(68 + time % 29).padStart(3, "0")}.04 Hz</b></div>
        </div>
      </section>

      <section className="work" id="work">
        <div className="section-head">
          <span>( 02 — SELECTED SIGNALS )</span>
          <p>Избранные эксперименты<br />на пересечении формы и функции.</p>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className={`project-card ${project.hue}`} key={project.no} tabIndex={0}>
              <div className="project-meta"><span>{project.no}</span><span>{project.type}</span><span>{project.year}</span></div>
              <div className="project-visual">
                <div className="shape shape-a" /><div className="shape shape-b" /><div className="scanlines" />
                <span className="view-label">VIEW CASE ↗</span>
              </div>
              <h2>{project.title}</h2>
            </article>
          ))}
        </div>
      </section>

      <section className="services scroll-reveal" id="services">
        <div className="services-intro">
          <span>( 03 — CAPABILITIES )</span>
          <h2>ONE STUDIO.<br /><em>NO FIXED ORBIT.</em></h2>
          <p>Собираем команды под задачу — от одной сильной идеи до запуска цифровой экосистемы.</p>
        </div>
        <div className="service-list">
          {services.map((service, index) => (
            <button className={`service-row ${activeService === index ? "active" : ""}`} key={service.no} onClick={() => setActiveService(index)} aria-expanded={activeService === index}>
              <span className="service-no">{service.no}</span>
              <strong>{service.title}</strong>
              <span className="service-toggle">{activeService === index ? "−" : "+"}</span>
              <span className="service-detail">{service.detail}</span>
              <span className="service-tags">{service.tags}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="numbers scroll-reveal" aria-label="Статистика студии">
        <div><strong>42</strong><span>МИРА ЗАПУЩЕНО</span></div>
        <div><strong>11</strong><span>ЧАСОВЫХ ПОЯСОВ</span></div>
        <div><strong>∞</strong><span>ВОЗМОЖНЫХ ОРБИТ</span></div>
        <div><strong>01</strong><span>ОБЩАЯ МИССИЯ</span></div>
      </section>

      <section className="manifesto" id="about">
        <div className="manifesto-index">( 04 — OUR SIGNAL )</div>
        <p>
          МЫ НЕ ДЕЛАЕМ<br />
          <span>«ПРОСТО КРАСИВО».</span><br />
          МЫ СОЗДАЁМ ЦИФРОВЫЕ<br />
          <span>МИРЫ С ХАРАКТЕРОМ.</span>
        </p>
        <div className="manifesto-note">Каждый пиксель должен<br />иметь причину двигаться.</div>
      </section>

      <section className="archive scroll-reveal">
        <div className="archive-head"><span>( 05 — EXTENDED ARCHIVE )</span><p>ПЕРЕТАСКИВАЙТЕ →</p></div>
        <div
          className="archive-track"
          ref={archiveRef}
          onPointerDown={beginArchiveDrag}
          onPointerMove={moveArchiveDrag}
          onPointerUp={endArchiveDrag}
          onPointerCancel={endArchiveDrag}
          onScroll={syncArchiveProgress}
          onPointerLeave={(event) => { if (archiveDrag.current.active && !event.currentTarget.hasPointerCapture(event.pointerId)) endArchiveDrag(event); }}
        >
          {archive.map((item, index) => (
            <article className={`archive-card archive-${index + 1}`} key={item} tabIndex={0}>
              <span>0{index + 4} / {2026 - index}</span>
              <div className="archive-art"><i /><b /></div>
              <h3>{item}</h3>
              <p>EXPERIMENTAL / DIGITAL</p>
            </article>
          ))}
        </div>
        <div
          className="archive-scrollbar"
          aria-label="Прокрутка архива"
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); scrubArchive(event); }}
          onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) scrubArchive(event); }}
          onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
        >
          <div style={{ transform: `translateX(${archiveProgress * 455}%)` }} />
        </div>
      </section>

      <section className="mood-lab scroll-reveal">
        <div><span>( 06 — TUNE THE FREQUENCY )</span><h2>CHOOSE YOUR<br /><em>GRAVITY.</em></h2></div>
        <div className="mood-switcher" role="group" aria-label="Цветовой режим сайта">
          {(["ultraviolet", "solar", "infra"] as const).map((item, index) => (
            <button key={item} className={mood === item ? "active" : ""} onClick={() => setMood(item)}>
              <span>0{index + 1}</span><strong>{item.toUpperCase()}</strong><i />
            </button>
          ))}
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-orbit" aria-hidden="true"><span>LET&apos;S MAKE IT REAL · </span></div>
        <p>ЕСТЬ ИДЕЯ ИЛИ ТОЛЬКО ИСКРА?</p>
        <a href="mailto:hello@orbital.fake">LET&apos;S TALK <span>↗</span></a>
        <footer><span>ORBITAL © 2026</span><span>BEYOND THE OBVIOUS</span><a href="#top">BACK TO TOP ↑</a></footer>
      </section>
    </main>
  );
}
