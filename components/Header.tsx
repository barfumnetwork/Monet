"use client";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-[6vw] md:px-[8vw] py-6 flex items-center justify-between pointer-events-none">
      <a href="#hero" className="pointer-events-auto text-accent font-bold text-2xl tracking-tight">
        LUMEN
      </a>
      <nav className="pointer-events-auto hidden md:flex items-center gap-10 text-sm text-ink/80">
        <a href="#features" className="hover:text-ink transition-colors">Features</a>
        <a href="#experience" className="hover:text-ink transition-colors">Experience it</a>
        <a href="#buy" className="hover:text-ink transition-colors font-medium">Buy now</a>
      </nav>
      <button type="button" aria-label="Open menu"
        className="pointer-events-auto md:hidden flex flex-col gap-1.5 p-2">
        <span className="block h-[2px] w-6 bg-ink" />
        <span className="block h-[2px] w-6 bg-ink" />
      </button>
    </header>
  );
}
