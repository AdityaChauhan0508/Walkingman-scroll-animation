import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const HEADLINE = "WELCOME ITZFIZZ".split("");

type Fact = { n: string; d: string; tone: string };
const TOP: Fact[] = [
  { n: "200+", d: "clients served, from first-time founders to established brands", tone: "bg-[#e4f25a] text-[#161616]" },
  { n: "2020", d: "the year Itzfizz started in Bengaluru, founded by Mohammed Faizan N", tone: "bg-[#2b2f3a] text-white" },
  { n: "4.8★", d: "average client rating across review platforms", tone: "bg-[#ff7a3d] text-[#161616]" },
];
const BOTTOM: Fact[] = [
  { n: "200%", d: "jump in LinkedIn engagement for one Itzfizz client", tone: "bg-[#79cdfd] text-[#161616]" },
  { n: "400+", d: "Instagram followers a designer gained in just four months", tone: "bg-[#2b2f3a] text-white" },
  { n: "10%", d: "conversion for a boutique site built in a month — about one lead a day", tone: "bg-[#e4f25a] text-[#161616]" },
];

const FactCard = ({ f }: { f: Fact }) => (
  <div className={`rounded-xl p-3 sm:rounded-2xl sm:p-6 ${f.tone}`}>
    <div className="font-display text-2xl leading-none font-extrabold sm:text-6xl">{f.n}</div>
    <p className="mt-2 text-[10px] leading-snug sm:mt-3 sm:text-base">{f.d}</p>
  </div>
);

export default function App() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const letters = q(".letter") as HTMLElement[];
      const walker = q(".walker")[0] as HTMLElement;
      const bob = q(".bob")[0];
      const band = q(".band")[0];
      const track = q(".track")[0] as HTMLElement;
      const cards = q(".fact") as HTMLElement[];
      const hint = q(".hint")[0];

      gsap.fromTo(walker, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out" });
      gsap.fromTo(bob, { y: 30 }, { y: 0, duration: 1.2, ease: "power3.out" });
      gsap.fromTo(hint, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 1, delay: 0.8, ease: "power2.out" });

      let lx: number[] = [], fx: number[] = [], wW = 0, vw = 0;
      const measure = () => {
        const tr = track.getBoundingClientRect();
        vw = tr.width;
        wW = walker.offsetWidth;
        fx = cards.map((c) => { const r = c.getBoundingClientRect(); return r.left - tr.left + r.width * 0.85; });
        lx = letters.map((l) => { const r = l.getBoundingClientRect(); return r.left - tr.left + r.width / 2; });
      };
      measure();
      ScrollTrigger.addEventListener("refreshInit", measure);

      let count = 0, fcount = 0;
      const setX = gsap.quickSetter(walker, "x", "px");
      const setWalkerScale = gsap.quickSetter(walker, "scale");
      const setBand = gsap.quickSetter(band, "scaleX");
      const setBobY = gsap.quickSetter(bob, "y", "px");
      const setBobR = gsap.quickSetter(bob, "rotation", "deg");

      ScrollTrigger.create({
        trigger: track,
        pin: true,
        start: "top top",
        end: () => "+=" + innerHeight * 3,
        scrub: reduce ? true : 0.8,
        onUpdate: (self) => {
          const p = self.progress;
          const x = p * (vw - wW);
          const front = x + wW * 0.65;
          setX(x);
          setWalkerScale(1.08 - p * 0.28);
          setBand(Math.min(1, front / vw));
          const phase = p * Math.PI * 2 * 8;
          setBobY(-Math.abs(Math.sin(phase)) * 8 * Math.min(1, p * 30));
          setBobR(Math.sin(phase) * 1);
          let c = 0;
          while (c < lx.length && front >= lx[c]) c++;
          if (c !== count) {
            letters.forEach((l, i) => l.classList.toggle("on", i < c));
            count = c;
          }
          gsap.set(hint, { autoAlpha: p > 0.02 ? 0 : 1, overwrite: "auto" });
          let k = 0;
          const f2 = p > 0.04 ? front : -1;
          while (k < fx.length && f2 >= fx[k]) k++;
          if (k !== fcount) {
            cards.forEach((c, i) => c.classList.toggle("on", fx[i] <= f2));
            fcount = k;
          }
        },
      });

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", measure);
      };
    }, root);

    const onResize = () => ScrollTrigger.refresh();
    addEventListener("resize", onResize);
    return () => {
      removeEventListener("resize", onResize);
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <main ref={root} className="relative">
        <section className="track relative h-screen w-full overflow-hidden">
          <div className="band absolute inset-x-0 top-1/2 h-[28vh] -translate-y-1/2 origin-left scale-x-0 bg-(--color-accent) will-change-transform" />
          <h1
            aria-label="Welcome Itzfizz"
            className="font-display absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 flex-wrap items-center px-4 text-[clamp(2.6rem,12vw,4.5rem)] leading-[0.95] font-extrabold tracking-wide sm:flex-nowrap sm:px-[3vw] sm:text-[clamp(1.8rem,7.4vw,8.5rem)]"
          >
            {HEADLINE.map((c, i) =>
              c === " " ? (
                <span key={i} aria-hidden className="letter block h-0 w-full sm:inline-block sm:w-[0.3em]" />
              ) : (
                <span key={i} aria-hidden className="letter inline-block mr-[0.06em] text-(--color-ink)">{c}</span>
              ),
            )}
          </h1>

          <div className="absolute inset-x-0 top-[3vh] z-30 px-4 sm:px-[3vw] sm:pr-[calc(var(--wh)*0.57+3vw)]">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {TOP.map((f) => <div key={f.n} className="fact fact-top"><FactCard f={f} /></div>)}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-[3vh] z-30 px-4 sm:px-[3vw] sm:pr-[calc(var(--wh)*0.57+3vw)]">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {BOTTOM.map((f) => <div key={f.n} className="fact fact-bottom"><FactCard f={f} /></div>)}
            </div>
          </div>

          <div
            className="walker absolute left-0 z-10 aspect-[1171/2062] pointer-events-none will-change-transform"
            style={{ top: "50%", height: "var(--wh)", marginTop: "calc(var(--wh) / -2)" }}
          >
            <div className="bob h-full w-full will-change-transform" style={{ transformOrigin: "50% 100%" }}>
              <img src={`${import.meta.env.BASE_URL}img/walker.png`} alt="Man walking with a rolled poster" className="h-full w-full select-none" draggable={false} />
            </div>
          </div>

          <p className="hint absolute bottom-[6vh] left-1/2 z-10 -translate-x-1/2 text-xs font-medium uppercase tracking-[0.4em] opacity-60">Scroll</p>
        </section>
      </main>
      <footer className="px-6 py-10 text-center text-sm opacity-70">
        Facts sourced from web, Build by Aditya Chauhan . All rights reserved @2026.
      </footer>
    </>
  );
}
