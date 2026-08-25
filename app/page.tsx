import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import SceneClient from "@/components/SceneClient";
import ScrollSections from "@/components/ScrollSections";

export default function Page() {
  return (
    <>
      {/* main = ScrollTrigger trigger. Footer DELIBERATELY outside main
          so ScrollTrigger end "bottom bottom" lands on section 6's bottom
          (when state 5 is fully active in the viewport). */}
      <main className="relative">
        <LoadingScreen />
        <Header />
        <div className="scene-fixed">
          <SceneClient />
        </div>
        <div className="section-stack">
          <ScrollSections />
        </div>
      </main>
      <footer className="relative z-10 py-12 px-[8vw] text-xs text-ink/45 flex justify-between">
        <span>© BARFÜM NETWORK</span>
        <span>Presse · Support · Datenschutz</span>
      </footer>
    </>
  );
}
