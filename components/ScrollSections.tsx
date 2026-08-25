"use client";

import FeatureStat from "./FeatureStat";

export default function ScrollSections() {
  return (
    <>
      {/* 1. HERO */}
      <section id="hero" data-section="hero" className="section relative">
        <div className="max-w-[640px] md:max-w-[52%] text-center lg:text-left mx-auto lg:mx-0">
          <p className="eyebrow mb-6" data-hero-text>Aufgebaut auf Menschen</p>
          <h1 className="headline text-ink" data-hero-text>Ein Netzwerk.</h1>
          <p
            className="mt-8 max-w-md mx-auto lg:mx-0 text-base md:text-lg text-ink/70 leading-relaxed"
            data-hero-text
          >
            Verbinde dich mit Menschen, baue Beziehungen auf und wachse
            gemeinsam. Ein einziges Netzwerk, geformt aus tausenden
            einzelnen Verbindungen.
          </p>
          <a href="#features" className="cta mt-10" data-hero-text>Netzwerk entdecken</a>
        </div>
        <div className="hidden lg:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-ink/60 text-xs tracking-wider">
          <span>Scrolle, um mehr zu entdecken</span>
          <span className="block w-px h-8 bg-ink/30" />
        </div>
      </section>

      {/* 2. VERBINDUNG */}
      <section id="features" data-section="connection" className="section relative justify-end">
        <div className="max-w-[420px] text-right md:text-left md:max-w-[40%] md:ml-auto lg:mt-[6vh]">
          <p className="eyebrow mb-4">Verbindung</p>
          <h2 className="headline-md text-ink">Jeder Knoten<br />zählt.</h2>
          <p className="mt-6 text-ink/70 leading-relaxed">
            Jeder Mensch im Netzwerk ist ein Vertrauenspunkt. Beziehungen
            — nicht bloße Zahlen — halten die Struktur zusammen.
          </p>
        </div>
      </section>

      {/* 3. WACHSTUM + KENNZAHLEN */}
      <section id="performance" data-section="growth" className="section relative">
        <div className="lg:absolute lg:bottom-[18vh] lg:left-[10vw] max-w-[420px]">
          <p className="eyebrow mb-3">Wachstum</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
            Wachstum, das sich<br />Verbindung für Verbindung ausbreitet.
          </h2>
        </div>
        <div className="mt-6 lg:mt-0 lg:absolute lg:top-[22vh] lg:right-[10vw] flex flex-row lg:flex-col gap-5 lg:gap-7 items-start lg:items-end">
          <FeatureStat label="Aktive Mitglieder" value="1000" unit="+" />
          <FeatureStat label="Länder" value="20" unit="+" />
          <FeatureStat label="Community-Events" value="150" unit="+" />
        </div>
      </section>

      {/* 4. COMMUNITY */}
      <section id="design" data-section="community" className="section relative">
        <div className="max-w-[480px] md:max-w-[40%]">
          <p className="eyebrow mb-4">Community</p>
          <h2 className="headline-md text-ink">Community<br />zuerst.</h2>
          <p className="mt-6 text-ink/70 leading-relaxed">
            Ein Netzwerk ist nur so stark wie die Menschen darin. Geteiltes
            Wissen, gegenseitige Unterstützung und echte Beziehungen
            stehen an erster Stelle — alles andere folgt daraus.
          </p>
        </div>
      </section>

      {/* 5. GLOBALE REICHWEITE */}
      <section id="display" data-section="global" className="section relative">
        <div className="max-w-[440px] md:max-w-[40%]">
          <p className="eyebrow mb-4">Globale Reichweite</p>
          <h2 className="headline-md text-ink">Gemeinsam<br />aufgebaut.</h2>
          <p className="mt-6 text-ink/70 leading-relaxed">
            Über Länder und Sprachen hinweg wächst dasselbe Netzwerk immer
            weiter — getragen von den Menschen, die Teil davon sind.
          </p>
        </div>
      </section>

      {/* 6. ABSCHLUSS / CTA */}
      <section id="experience" data-section="final" className="section relative">
        <div className="w-full flex items-center justify-center lg:justify-end">
          <div className="text-center lg:text-right max-w-[85%] lg:max-w-[min(520px,46vw)] w-full">
            <p className="eyebrow mb-4">Dein Zug</p>
            <h2 className="final-title text-ink">
              Dein Netzwerk.<br />
              Dein Wachstum.<br />
              <span className="relative inline-block">
                <span className="relative z-10 text-white px-6 italic">Dein nächster Schritt.</span>
                <span className="absolute inset-0 bg-accent rounded-full -z-0 translate-y-[6%]" />
              </span>
            </h2>
            <div className="mt-8 flex justify-center lg:justify-end">
              <a href="#buy" id="buy" className="cta">Netzwerk beitreten</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
