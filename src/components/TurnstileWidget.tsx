"use client"

import { useEffect, useRef, useCallback } from "react"

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: TurnstileRenderOptions) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

interface TurnstileRenderOptions {
  sitekey: string
  callback: (token: string) => void
  "expired-callback"?: () => void
  "error-callback"?: () => void
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "compact"
  language?: string
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
}

const SCRIPT_ID = "cf-turnstile-script"
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function TurnstileWidget({ onVerify, onExpire, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return
    if (!SITE_KEY) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: onVerify,
      "expired-callback": onExpire,
      "error-callback": onError,
      theme: "light",
      language: "it",
    })
  }, [onVerify, onExpire, onError])

  useEffect(() => {
    if (!SITE_KEY) return

    // Script già caricato e API pronta
    if (window.turnstile) {
      renderWidget()
      return
    }

    // Script tag già nel DOM (da un altro widget) — aspetta l'evento load
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existingScript) {
      existingScript.addEventListener("load", renderWidget)
      return () => existingScript.removeEventListener("load", renderWidget)
    }

    // Prima volta: inietta lo script
    const script = document.createElement("script")
    script.id = SCRIPT_ID
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
    script.async = true
    script.defer = true
    script.onload = renderWidget
    document.head.appendChild(script)

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [renderWidget])

  if (!SITE_KEY) return null

  return <div ref={containerRef} className="mt-1" />
}
