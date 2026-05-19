"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Link from "next/link"
import Image from "next/image"

interface Slide {
  id: string
  imageUrl: string
  caption: string | null
  linkUrl: string | null
  linkText: string | null
  isActive: boolean
}

export function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const active = useMemo(() => slides.filter((s) => s.isActive), [slides])
  const [current, setCurrent] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const imgWrappersRef = useRef<(HTMLDivElement | null)[]>([])

  const next = useCallback(() => setCurrent((c) => (c + 1) % active.length), [active.length])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + active.length) % active.length), [active.length])

  useEffect(() => {
    if (active.length <= 1) return
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [active.length, next])

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return
      const scrolled = Math.max(0, -sectionRef.current.getBoundingClientRect().top)
      const y = Math.min(scrolled * 0.05, 20)
      imgWrappersRef.current.forEach((el) => { if (el) el.style.transform = `translateY(${y}px)` })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (active.length === 0) {
    return (
      <section className="relative w-full h-[90vh] min-h-[560px] flex items-center justify-center bg-primary-container overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
        <div className="relative z-10 text-center max-w-3xl px-6 flex flex-col items-center">
          <h1 className="font-newsreader text-5xl md:text-6xl font-normal text-on-primary-container mb-6 leading-tight">
            Crochet che porta<br /><em>la natura con sé.</em>
          </h1>
          <p className="text-lg text-on-primary-container/85 mb-10 max-w-xl leading-relaxed">
            Pezzi artigianali realizzati con fibre naturali eticamente scelte.
          </p>
          <Link href="/shop" className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-primary/90 transition-colors shadow-md">
            Scopri il catalogo
          </Link>
        </div>
      </section>
    )
  }

  const slide = active[current]

  return (
    <section ref={sectionRef} className="relative w-full h-[90vh] min-h-[560px] overflow-hidden bg-neutral-900">
      {active.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <div
            ref={(el) => { imgWrappersRef.current[i] = el }}
            className="absolute left-0 right-0 will-change-transform"
            style={{ top: -20, bottom: -20 }}
          >
            <Image
              src={s.imageUrl}
              alt={s.caption ?? ""}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent z-10" />

      {(slide.caption || slide.linkUrl) && (
        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-20 px-6 text-center">
          {slide.caption && (
            <p className="font-newsreader text-3xl md:text-5xl font-normal text-white mb-6 leading-tight drop-shadow-lg max-w-2xl">
              {slide.caption}
            </p>
          )}
          {slide.linkUrl && (
            <Link
              href={slide.linkUrl}
              className="bg-white text-neutral-900 px-8 py-3.5 rounded-full font-semibold text-sm tracking-wide hover:bg-white/90 transition-colors shadow-lg"
            >
              {slide.linkText ?? "Scopri di più"}
            </Link>
          )}
        </div>
      )}

      {active.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
            aria-label="Precedente"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
            aria-label="Successiva"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {active.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-white w-6" : "bg-white/50 w-1.5"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
