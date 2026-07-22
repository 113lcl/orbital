"use client";

import { useEffect, useRef, useState } from "react";

const projects = [
  { no: "01", title: "NEON / OBJECT", type: "Identity + Digital", year: "2026", hue: "lime", href: "/projects/neon-object" },
  { no: "02", title: "FLUID SIGNAL", type: "Experience + Motion", year: "2026", hue: "violet", href: "/projects/fluid-signal" },
  { no: "03", title: "AFTERLIGHT", type: "Strategy + Product", year: "2025", hue: "coral", href: "/projects/afterlight" },
  { no: "04", title: "SONIC / BLOOM", type: "AI + Interactive", year: "2025", hue: "cyan", href: "/projects/sonic-bloom" },
];

const services = [
  { no: "01", title: "BRAND SYSTEMS", detail: "Strategy, positioning and a visual language that stays recognizable without a logo.", tags: "STRATEGY / IDENTITY / VOICE" },
  { no: "02", title: "DIGITAL WORLDS", detail: "Sites and products where technology becomes part of the story, not just its container.", tags: "WEB / PRODUCT / CREATIVE DEV" },
  { no: "03", title: "MOTION MATTER", detail: "Kinetic typography, 3D and motion systems that turn attention into emotion.", tags: "MOTION / 3D / INTERACTION" },
  { no: "04", title: "FUTURE SIGNALS", detail: "Experiments with AI and emerging interfaces for brands that have outgrown the present.", tags: "AI / R&D / INSTALLATIONS" },
];

const archive = ["TOKYO TYPE", "SUBZERO", "LOST SIGNAL", "MARS/01", "NIGHTSHIFT", "KINETIC FM"];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [time, setTime] = useState(0);
  const [labMode, setLabMode] = useState<"attract" | "repel" | "vortex">("attract");
  const [activeService, setActiveService] = useState(0);
  const [mood, setMood] = useState<"ultraviolet" | "solar" | "infra">("ultraviolet");
  const [portraitScan, setPortraitScan] = useState(false);
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
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in-view"));
    }, { threshold: 0.16 });
    document.querySelectorAll(".scroll-reveal").forEach((element) => observer.observe(element));
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("keydown", keyboard);
    return () => {
      window.clearTimeout(intro);
      window.clearInterval(clock);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("keydown", keyboard);
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
    const progress = max > 0 ? track.scrollLeft / max : 0;
    setArchiveProgress(progress < .003 ? 0 : progress > .997 ? 1 : progress);
  };

  const scrubArchive = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = archiveRef.current;
    if (!track) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const edgeLockedRatio = ratio < .025 ? 0 : ratio > .975 ? 1 : ratio;
    track.classList.add("is-dragging");
    track.scrollLeft = edgeLockedRatio * (track.scrollWidth - track.clientWidth);
    document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
    document.documentElement.style.setProperty("--my", `${event.clientY}px`);
    syncArchiveProgress();
  };

  const endArchiveScrub = (event: React.PointerEvent<HTMLDivElement>) => {
    archiveRef.current?.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    window.requestAnimationFrame(syncArchiveProgress);
  };

  const scrollToNext = () => document.querySelector("#portrait")?.scrollIntoView({ behavior: "smooth" });

  const movePortrait = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    event.currentTarget.style.setProperty("--portrait-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--portrait-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--portrait-rx", `${(0.5 - y) * 5}deg`);
    event.currentTarget.style.setProperty("--portrait-ry", `${(x - 0.5) * 7}deg`);
  };

  const resetPortrait = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--portrait-x", "50%");
    event.currentTarget.style.setProperty("--portrait-y", "50%");
    event.currentTarget.style.setProperty("--portrait-rx", "0deg");
    event.currentTarget.style.setProperty("--portrait-ry", "0deg");
  };

  return (
    <main className={`${loaded ? "site is-loaded" : "site"} mood-${mood}`}>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-glow" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="nav">
        <a className="brand" href="#top" aria-label="Orbital, back to top">
          <span className="brand-mark">O/</span>
          <span>ORBITAL<br />SYSTEMS</span>
        </a>
        <div className="nav-status">
          <i /> IN MOTION · 20{26 + Math.floor(time / 31536000)}
        </div>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="orbital-menu" aria-label={menuOpen ? "Close navigation" : "Open navigation"}>
          <span>{menuOpen ? "CLOSE" : "INDEX"}</span>
          <b>{menuOpen ? "×" : "+"}</b>
        </button>
      </header>

      <div className={`menu-panel ${menuOpen ? "is-open" : ""}`} id="orbital-menu" aria-hidden={!menuOpen}>
        <nav>
          <a href="#portrait" onClick={() => setMenuOpen(false)}><span>01</span> Visual artifact</a>
          <a href="#work" onClick={() => setMenuOpen(false)}><span>02</span> Selected work</a>
          <a href="#services" onClick={() => setMenuOpen(false)}><span>03</span> Capabilities</a>
          <a href="#about" onClick={() => setMenuOpen(false)}><span>04</span> Our signal</a>
          <a href="#experiments" onClick={() => setMenuOpen(false)}><span>06</span> New experiments</a>
          <a href="#matter" onClick={() => setMenuOpen(false)}><span>07</span> Unstable matter</a>
          <a href="#frequency" onClick={() => setMenuOpen(false)}><span>08</span> Tune frequency</a>
          <a href="#archive" onClick={() => setMenuOpen(false)}><span>05</span> Archive</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}><span>09</span> Contact</a>
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
          <p>STRATEGY, DESIGN AND TECHNOLOGY<br />FOR BRANDS THAT ARE NOT AFRAID<br />TO PULL ATTENTION INTO ORBIT.</p>
          <button className="round-button magnetic" onClick={scrollToNext} aria-label="Explore the next section">
            <span>EXPLORE<br />THE ORBIT</span><b>↓</b>
          </button>
          <div className="coordinates">52.2297° N<br />21.0122° E</div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div><span>IDEAS IN MOTION</span> ✦ <span>DESIGNED TO DISTURB</span> ✦ <span>IDEAS IN MOTION</span> ✦ <span>DESIGNED TO DISTURB</span> ✦</div>
      </div>

      <section className={`portrait ${portraitScan ? "is-scanning" : ""}`} id="portrait">
        <div className="portrait-head">
          <span>( VISUAL ARTIFACT / OG-01 )</span>
          <span>1536 × 1024 · GENERATED IN ORBIT</span>
        </div>
        <div className="portrait-intro">
          <h2>THE FACE OF<br /><em>DIGITAL GRAVITY.</em></h2>
          <div>
            <p>The ORBITAL/26 cover is not decoration. It is a frozen frame from our digital universe.</p>
            <button type="button" onClick={() => setPortraitScan((value) => !value)} aria-pressed={portraitScan}>
              <i /> {portraitScan ? "DISENGAGE SCAN" : "SCAN THE ARTIFACT"}
            </button>
            <a className="portrait-enter" href="/artifact">ENTER THE VOID ↗</a>
          </div>
        </div>
        <div className="portrait-stage" onPointerMove={movePortrait} onPointerLeave={resetPortrait}>
          <div className="portrait-image" role="img" aria-label="ORBITAL/26 Digital Gravity ultraviolet and acid space object">
            <div className="portrait-glare" aria-hidden="true" />
            <div className="portrait-scanline" aria-hidden="true" />
            <div className="portrait-target" aria-hidden="true"><i /><span>GRAVITY<br />LOCKED</span></div>
          </div>
          <div className="portrait-data" aria-hidden="true">
            <span>OBJECT / 001</span>
            <span>SPECTRUM / UV—ACID</span>
            <span>STATE / {portraitScan ? "SCANNING" : "DORMANT"}</span>
          </div>
        </div>
      </section>

      <section className="lab scroll-reveal" id="lab">
        <div className="lab-head">
          <span>( 01 — INTERACTION LAB )</span>
          <p>Move through the field.<br />Choose a law of digital physics.</p>
        </div>
        <div className={`lab-stage mode-${labMode}`}>
          <canvas ref={canvasRef} aria-label="Interactive particle field" />
          <div className="lab-title"><span>TOUCH THE</span><strong>SIGNAL</strong></div>
          <div className="lab-controls" role="group" aria-label="Particle movement mode">
            {(["attract", "repel", "vortex"] as const).map((mode) => (
              <button key={mode} onClick={() => setLabMode(mode)} className={labMode === mode ? "active" : ""}>
                <i /> {mode.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="lab-reading"><span>FIELD / {labMode.toUpperCase()}</span><b>{String(68 + time % 29).padStart(3, "0")}.04 Hz</b></div>
          <a className="lab-enter" href="/signal-lab">OPEN FULL LAB ↗</a>
        </div>
      </section>

      <section className="work" id="work">
        <div className="section-head">
          <span>( 02 — SELECTED SIGNALS )</span>
          <p>Selected experiments<br />where form collides with function.</p>
        </div>
        <div className="project-grid">
          {projects.map((project) => (
            <a className="project-link" href={project.href} key={project.no} aria-label={`Open ${project.title} experiment`}>
              <article className={`project-card ${project.hue}`}>
                <div className="project-meta"><span>{project.no}</span><span>{project.type}</span><span>{project.year}</span></div>
                <div className="project-visual">
                  <div className="shape shape-a" /><div className="shape shape-b" /><div className="scanlines" />
                  <span className="view-label">ENTER WORLD ↗</span>
                </div>
                <h2>{project.title}</h2>
              </article>
            </a>
          ))}
        </div>
      </section>

      <section className="services scroll-reveal" id="services">
        <div className="services-intro">
          <span>( 03 — CAPABILITIES )</span>
          <h2>ONE STUDIO.<br /><em>NO FIXED ORBIT.</em></h2>
          <p>We assemble the right team for every mission — from one sharp idea to a complete digital ecosystem.</p>
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

      <section className="numbers scroll-reveal" aria-label="Studio statistics">
        <div><strong>42</strong><span>WORLDS LAUNCHED</span></div>
        <div><strong>11</strong><span>TIME ZONES</span></div>
        <div><strong>∞</strong><span>POSSIBLE ORBITS</span></div>
        <div><strong>01</strong><span>SHARED MISSION</span></div>
      </section>

      <section className="manifesto" id="about">
        <div className="manifesto-index">( 04 — OUR SIGNAL )</div>
        <p>
          WE DO NOT MAKE<br />
          <span>“JUST PRETTY.”</span><br />
          WE BUILD DIGITAL<br />
          <span>WORLDS WITH A PULSE.</span>
        </p>
        <div className="manifesto-note">Every pixel needs<br />a reason to move.</div>
      </section>

      <section className="future-index scroll-reveal" id="experiments">
        <div className="future-index-head"><span>( 06 — OPEN EXPERIMENTS )</span><p>THREE NEW INSTRUMENTS<br />FOR CURIOUS HUMANS.</p></div>
        <div className="future-index-grid">
          <a href="/observatory" className="future-index-card future-card-space">
            <span>06.1 / DEEP FIELD</span><div className="future-card-art"><i /><b /></div><h2>OBSERVATORY</h2><p>MOVE THE LENS · LOCK A STAR ↗</p>
          </a>
          <a href="/type-engine" className="future-index-card future-card-type">
            <span>06.2 / KINETIC LETTERS</span><div className="future-card-art"><strong>Aa</strong></div><h2>TYPE ENGINE</h2><p>STRETCH LANGUAGE · BREAK THE GRID ↗</p>
          </a>
          <a href="/echo-chamber" className="future-index-card future-card-echo">
            <span>06.3 / SIGNAL MEMORY</span><div className="future-card-art"><i /><i /><i /></div><h2>ECHO CHAMBER</h2><p>DRAW A WAVE · RELEASE AN ECHO ↗</p>
          </a>
        </div>
      </section>

      <section className="wave-index scroll-reveal" id="matter">
        <div className="wave-index-title"><span>( 07 — UNSTABLE MATTER )</span><h2>THREE SYSTEMS.<br /><i>NONE STAY STILL.</i></h2></div>
        <div className="wave-index-list">
          <a href="/gravity-loom" className="wave-index-row loom-row"><span>07.1</span><h3>GRAVITY LOOM</h3><p>FILAMENT / FIELD</p><i>↗</i></a>
          <a href="/time-rift" className="wave-index-row rift-row"><span>07.2</span><h3>TIME RIFT</h3><p>SCROLL / STORY</p><i>↗</i></a>
          <a href="/signal-garden" className="wave-index-row garden-row"><span>07.3</span><h3>SIGNAL GARDEN</h3><p>GENERATIVE / GROWTH</p><i>↗</i></a>
        </div>
      </section>

      <section className="mood-lab scroll-reveal" id="frequency">
        <div><span>( 08 — TUNE THE FREQUENCY )</span><h2>CHOOSE YOUR<br /><em>GRAVITY.</em></h2></div>
        <div className="mood-switcher" role="group" aria-label="Site color mode">
          {(["ultraviolet", "solar", "infra"] as const).map((item, index) => (
            <button key={item} className={mood === item ? "active" : ""} onClick={() => setMood(item)}>
              <span>0{index + 1}</span><strong>{item.toUpperCase()}</strong><i />
            </button>
          ))}
        </div>
      </section>

      <section className="archive scroll-reveal" id="archive">
        <div className="archive-head"><span>( 05 — EXTENDED ARCHIVE )</span><p>DRAG TO NAVIGATE →</p></div>
        <div
          className="archive-track"
          data-cursor="DRAG"
          ref={archiveRef}
          onPointerDown={beginArchiveDrag}
          onPointerMove={moveArchiveDrag}
          onPointerUp={endArchiveDrag}
          onPointerCancel={endArchiveDrag}
          onScroll={syncArchiveProgress}
          onPointerLeave={(event) => { if (archiveDrag.current.active && !event.currentTarget.hasPointerCapture(event.pointerId)) endArchiveDrag(event); }}
        >
          {archive.map((item, index) => (
            <article className={`archive-card archive-${index + 1}`} key={item}>
              <span>0{index + 4} / {2026 - index}</span>
              <div className="archive-art"><i /><b /></div>
              <h3>{item}</h3>
              <p>EXPERIMENTAL / DIGITAL</p>
            </article>
          ))}
        </div>
        <div
          className="archive-scrollbar"
          data-cursor="SCRUB"
          aria-label="Archive navigation"
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); scrubArchive(event); }}
          onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) scrubArchive(event); }}
          onPointerUp={endArchiveScrub}
          onPointerCancel={endArchiveScrub}
        >
          <div style={{ transform: `translateX(${archiveProgress * 455}%)` }} />
        </div>
        <a className="archive-enter" href="/archive">ENTER ARCHIVE TRANSMISSION ↗</a>
      </section>

      <section className="contact" id="contact">
        <div className="contact-orbit" aria-hidden="true"><span>LET&apos;S MAKE IT REAL · </span></div>
        <p>HAVE AN IDEA — OR ONLY A SPARK?</p>
        <a href="mailto:tmxkir14@gmail.com">LET&apos;S TALK <span>↗</span></a>
        <footer><span>ORBITAL © 2026</span><span>BEYOND THE OBVIOUS</span><a href="#top">BACK TO TOP ↑</a></footer>
      </section>
    </main>
  );
}
