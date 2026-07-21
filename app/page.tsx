"use client";

import { useEffect, useRef, useState } from "react";

const projects = [
  { no: "01", title: "NEON / OBJECT", type: "Identity + Digital", year: "2026", hue: "lime" },
  { no: "02", title: "FLUID SIGNAL", type: "Experience + Motion", year: "2026", hue: "violet" },
  { no: "03", title: "AFTERLIGHT", type: "Strategy + Product", year: "2025", hue: "coral" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [time, setTime] = useState(0);
  const orbRef = useRef<HTMLDivElement>(null);

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
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.clearTimeout(intro);
      window.clearInterval(clock);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  const scrollToWork = () => document.querySelector("#work")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className={loaded ? "site is-loaded" : "site"}>
      <div className="cursor-glow" aria-hidden="true" />
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

      <section className="work" id="work">
        <div className="section-head">
          <span>( 01 — SELECTED SIGNALS )</span>
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

      <section className="manifesto" id="about">
        <div className="manifesto-index">( 02 — OUR SIGNAL )</div>
        <p>
          МЫ НЕ ДЕЛАЕМ<br />
          <span>«ПРОСТО КРАСИВО».</span><br />
          МЫ СОЗДАЁМ ЦИФРОВЫЕ<br />
          <span>МИРЫ С ХАРАКТЕРОМ.</span>
        </p>
        <div className="manifesto-note">Каждый пиксель должен<br />иметь причину двигаться.</div>
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
