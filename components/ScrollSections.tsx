"use client";

import FeatureStat from "./FeatureStat";

export default function ScrollSections() {
  return (
    <>
      {/* 1. HERO */}
      <section id="hero" data-section="hero" className="section relative">
        <div className="max-w-[640px] md:max-w-[52%] text-center lg:text-left mx-auto lg:mx-0">
          <p className="eyebrow mb-6" data-hero-text>Built around people</p>
          <h1 className="headline text-ink" data-hero-text>One network.</h1>
          <p
            className="mt-8 max-w-md mx-auto lg:mx-0 text-base md:text-lg text-ink/70 leading-relaxed"
            data-hero-text
          >
            Connect with people, build relationships and grow together. A
            single network, made of thousands of individual connections.
          </p>
          <a href="#features" className="cta mt-10" data-hero-text>Explore the network</a>
        </div>
        <div className="hidden lg:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-ink/60 text-xs tracking-wider">
          <span>Start scrolling to explore</span>
          <span className="block w-px h-8 bg-ink/30" />
        </div>
      </section>

      {/* 2. CONNECTION */}
      <section id="features" data-section="connection" className="section relative justify-end">
        <div className="max-w-[420px] text-right md:text-left md:max-w-[40%] md:ml-auto lg:mt-[6vh]">
          <p className="eyebrow mb-4">Connection</p>
          <h2 className="headline-md text-ink">Every node<br />matters.</h2>
          <p className="mt-6 text-ink/70 leading-relaxed">
            Every person in the network is a point of trust. Relationships,
            not just numbers, are what make the structure hold together.
          </p>
        </div>
      </section>

      {/* 3. GROWTH + STATS */}
      <section id="performance" data-section="growth" className="section relative">
        <div className="lg:absolute lg:bottom-[18vh] lg:left-[10vw] max-w-[420px]">
          <p className="eyebrow mb-3">Growth</p>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
            Growth that spreads<br />one connection at a time.
          </h2>
        </div>
        <div className="mt-6 lg:mt-0 lg:absolute lg:top-[22vh] lg:right-[10vw] flex flex-row lg:flex-col gap-5 lg:gap-7 items-start lg:items-end">
          <FeatureStat label="Active members" value="1000" unit="+" />
          <FeatureStat label="Countries" value="20" unit="+" />
          <FeatureStat label="Community events" value="150" unit="+" />
        </div>
      </section>

      {/* 4. COMMUNITY */}
      <section id="design" data-section="community" className="section relative">
        <div className="max-w-[480px] md:max-w-[40%]">
          <p className="eyebrow mb-4">Community</p>
          <h2 className="headline-md text-ink">Community<br />first.</h2>
          <p className="mt-6 text-ink/70 leading-relaxed">
            A network is only as strong as the people inside it. Shared
            knowledge, mutual support, and real relationships come first —
            everything else follows from that.
          </p>
        </div>
      </section>

      {/* 5. GLOBAL REACH */}
      <section id="display" data-section="global" className="section relative">
        <div className="max-w-[440px] md:max-w-[40%]">
          <p className="eyebrow mb-4">Global reach</p>
          <h2 className="headline-md text-ink">Built<br />together.</h2>
          <p className="mt-6 text-ink/70 leading-relaxed">
            Across countries and languages, the same network keeps
            expanding — carried forward by the people who are part of it.
          </p>
        </div>
      </section>

      {/* 6. FINAL / CTA */}
      <section id="experience" data-section="final" className="section relative">
        <div className="w-full flex items-center justify-center lg:justify-end">
          <div className="text-center lg:text-right max-w-[85%] lg:max-w-[min(520px,46vw)] w-full">
            <p className="eyebrow mb-4">Your move</p>
            <h2 className="final-title text-ink">
              Your network.<br />
              Your growth.<br />
              <span className="relative inline-block">
                <span className="relative z-10 text-white px-6 italic">Your next move.</span>
                <span className="absolute inset-0 bg-accent rounded-full -z-0 translate-y-[6%]" />
              </span>
            </h2>
            <div className="mt-8 flex justify-center lg:justify-end">
              <a href="#buy" id="buy" className="cta">Join the network</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
