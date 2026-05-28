import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = {
  title: "GanaWeb — Siti web professionali in pochi giorni",
  description: "GanaWeb realizza siti vetrina e piattaforme dinamiche con tecnologie moderne. Veloce, performante, consegnato in pochi giorni.",
  robots: { index: false, follow: false },
}

// ── Dati statici ────────────────────────────────────────────────────────────

const SERVICES = [
  {
    icon: "web",
    title: "Sito Vetrina",
    badge: "Ideale per piccole imprese",
    description:
      "Presentazione professionale del tuo brand, servizi e contatti. Design curato, mobile-first, ottimizzato per i motori di ricerca.",
    features: ["Homepage + pagine custom", "SEO tecnico completo", "Form contatti", "Google Analytics", "Certificato SSL"],
    color: "bg-primary/8 border-primary/20",
    badgeColor: "bg-primary/10 text-primary",
  },
  {
    icon: "database",
    title: "Sito Dinamico",
    badge: "Per e-commerce e portali",
    description:
      "Piattaforme con gestione contenuti, catalogo prodotti, ordini e pannello amministrativo — come questo sito GeF Crochet.",
    features: ["Pannello admin custom", "Catalogo / e-commerce", "Newsletter + email automatiche", "Dashboard analytics", "API REST"],
    color: "bg-surface-container border-outline-variant",
    badgeColor: "bg-surface-container-high text-on-surface-variant",
  },
]

const STEPS = [
  {
    num: "01",
    icon: "forum",
    title: "Briefing",
    desc: "Una chiamata o uno scambio di email per capire obiettivi, stile e funzionalità. Bastano 30 minuti.",
  },
  {
    num: "02",
    icon: "code",
    title: "Sviluppo",
    desc: "Costruiamo il sito con Next.js, Tailwind e le tecnologie più moderne. Aggiornamenti in tempo reale.",
  },
  {
    num: "03",
    icon: "rocket_launch",
    title: "Deploy & consegna",
    desc: "Il sito va online su Vercel con dominio personalizzato, SSL e CDN globale. Pronto in pochi giorni.",
  },
]

const STACK = [
  { label: "Next.js 16", color: "bg-zinc-900 text-zinc-100" },
  { label: "React 19", color: "bg-sky-950 text-sky-200" },
  { label: "TypeScript", color: "bg-blue-950 text-blue-300" },
  { label: "Tailwind CSS", color: "bg-cyan-950 text-cyan-300" },
  { label: "Prisma + Turso", color: "bg-emerald-950 text-emerald-300" },
  { label: "Vercel Edge", color: "bg-zinc-800 text-zinc-200" },
  { label: "Cloudinary", color: "bg-purple-950 text-purple-300" },
  { label: "Nodemailer", color: "bg-rose-950 text-rose-300" },
]

// ── Componente terminale ─────────────────────────────────────────────────────

function Terminal() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 font-mono text-sm leading-relaxed">
      {/* Barra titolo */}
      <div className="bg-zinc-800 px-4 py-3 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
        <span className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
        <span className="ml-3 text-zinc-400 text-xs">ganaweb — deploy log</span>
      </div>
      {/* Corpo */}
      <div className="bg-zinc-950 px-5 py-5 space-y-1.5">
        <Line prompt="$" cmd="npx create-next-app@latest tuo-sito --typescript" />
        <Line out="✔ Installing dependencies…" color="text-zinc-500" />
        <Line out="✔ Project created successfully" color="text-emerald-400" />
        <div className="py-1" />
        <Line prompt="$" cmd="npm run build" />
        <Line out="  ▲ Next.js 16.2.5" color="text-zinc-400" />
        <Line out="  ✓ Compiled successfully" color="text-emerald-400" />
        <Line out="  ✓ Collecting page data" color="text-zinc-400" />
        <Line out="  ✓ Generating static pages (12/12)" color="text-zinc-400" />
        <Line out="  ✓ Build in 8.3s" color="text-emerald-400" />
        <div className="py-1" />
        <Line prompt="$" cmd="vercel --prod" />
        <Line out="  Deploying to production…" color="text-zinc-400" />
        <Line out="  ✔ Build complete" color="text-emerald-400" />
        <Line out="  ✔ https://tuo-sito.vercel.app  [ready]" color="text-sky-400" />
        <div className="py-1" />
        <div className="flex items-center gap-1.5">
          <span className="text-primary">$</span>
          <span className="text-zinc-300">_</span>
          <span className="inline-block w-2 h-4 bg-primary animate-pulse rounded-sm" />
        </div>
      </div>
    </div>
  )
}

function Line({ prompt, cmd, out, color }: { prompt?: string; cmd?: string; out?: string; color?: string }) {
  if (out) return <p className={color ?? "text-zinc-300"}>{out}</p>
  return (
    <p>
      <span className="text-primary mr-2">{prompt}</span>
      <span className="text-zinc-100">{cmd}</span>
    </p>
  )
}

// ── Pagina ───────────────────────────────────────────────────────────────────

export default function GanaWebPage() {
  return (
    <>
      <Header />
      <main className="flex-1">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="bg-primary-fixed py-20 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            {/* Testo */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full tracking-widest uppercase">
                <span className="material-symbols-outlined text-[14px]">code</span>
                GanaWeb — sviluppo web
              </div>
              <h1 className="font-newsreader text-4xl lg:text-5xl font-semibold text-on-surface leading-tight">
                Il tuo sito web<br />
                <span className="text-primary">in pochi giorni.</span>
              </h1>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                Realizziamo siti vetrina e piattaforme dinamiche con le tecnologie
                più moderne. Veloci, curati nel design, consegnati in tempi certi.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:info@ganaweb.it"
                  className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-2xl font-medium hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  Scrivici
                </a>
                <a
                  href="https://ganaweb.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-outline-variant text-on-surface px-5 py-3 rounded-2xl font-medium hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  ganaweb.it
                </a>
              </div>
            </div>
            {/* Terminale */}
            <div className="w-full">
              <Terminal />
            </div>
          </div>
        </section>

        {/* ── STACK TECNOLOGICO ────────────────────────────────── */}
        <section className="bg-zinc-950 py-8 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-4 text-center">
              // stack tecnologico
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {STACK.map((s) => (
                <span
                  key={s.label}
                  className={`${s.color} px-3 py-1.5 rounded-lg text-xs font-mono font-medium`}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVIZI ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Cosa realizziamo</p>
            <h2 className="font-newsreader text-3xl font-semibold text-on-surface">
              Due tipi di sito, zero compromessi
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className={`${s.color} border rounded-3xl p-8 space-y-5`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">{s.icon}</span>
                  </div>
                  <span className={`${s.badgeColor} text-xs font-semibold px-3 py-1 rounded-full`}>
                    {s.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-newsreader text-2xl font-semibold text-on-surface mb-2">{s.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{s.description}</p>
                </div>
                <ul className="space-y-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── ESEMPIO REALE ────────────────────────────────────── */}
        <section className="bg-surface-container-low border-y border-outline-variant py-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Finto snippet di codice */}
            <div className="rounded-2xl overflow-hidden border border-zinc-700 font-mono text-sm mb-10 shadow-lg">
              <div className="bg-zinc-800 px-4 py-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
                <span className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                <span className="ml-3 text-zinc-400 text-xs">gefcrochet.it — case study</span>
              </div>
              <div className="bg-zinc-950 px-5 py-4 overflow-x-auto">
                <pre className="text-zinc-300 leading-relaxed whitespace-pre">{`// gefcrochet.it — e-commerce artigianale
// costruito da GanaWeb in pochi giorni

const features = [
  "catalogo prodotti + filtri",
  "carrello e checkout con CAPTCHA",
  "pannello admin completo",
  "newsletter con editor AI (Groq)",
  "email conferma ordine personalizzate",
  "analytics dashboard",
  "SEO + sitemap automatica",
]

deploy({
  framework: "Next.js 16",
  db: "Turso (SQLite edge)",
  hosting: "Vercel (CDN globale)",`}
                  <span className="text-emerald-400">{`\n  status: "✔ live in production",`}</span>
                  {`\n})`}
                </pre>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Esempio reale</p>
              <h2 className="font-newsreader text-2xl font-semibold text-on-surface">
                Questo sito è stato realizzato da GanaWeb
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed max-w-xl mx-auto">
                gefcrochet.it — e-commerce completo con catalogo, carrello, pannello admin, newsletter
                con generazione AI e analytics — costruito con Next.js, Tailwind e Turso.
              </p>
            </div>
          </div>
        </section>

        {/* ── COME FUNZIONA ─────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Processo</p>
            <h2 className="font-newsreader text-3xl font-semibold text-on-surface">
              Dal briefing al deploy in 3 passi
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {/* Connettore */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(100%-0px)] w-full h-px border-t-2 border-dashed border-outline-variant z-0 translate-x-4" />
                )}
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">{step.icon}</span>
                    </div>
                    <span className="font-mono text-xs text-primary font-bold tracking-widest">{step.num}</span>
                  </div>
                  <h3 className="font-semibold text-on-surface text-lg">{step.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="bg-primary py-20 px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-white text-3xl">terminal</span>
            </div>
            <h2 className="font-newsreader text-3xl font-semibold text-white">
              Pronto a portare online<br />la tua idea?
            </h2>
            <p className="text-white/75 leading-relaxed">
              Raccontaci il tuo progetto — valutiamo insieme il tipo di sito, i tempi e i costi.
              Risposta garantita entro 24 ore.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:info@ganaweb.it"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3.5 rounded-2xl font-semibold hover:bg-white/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
                info@ganaweb.it
              </a>
              <a
                href="https://ganaweb.it"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3.5 rounded-2xl font-semibold hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">language</span>
                ganaweb.it
              </a>
            </div>
          </div>
        </section>

        {/* ── BACK AL NEGOZIO ──────────────────────────────────── */}
        <div className="text-center py-8 bg-surface-container-low border-t border-outline-variant">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Torna a GeF Crochet
          </Link>
        </div>

      </main>
      <Footer />
    </>
  )
}
