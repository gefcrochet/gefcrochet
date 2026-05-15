"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

interface CookiePrefs {
  necessary: true
  personalization: boolean
  marketing: boolean
  analytics: boolean
}

interface CookieConsentCtx {
  openBanner: () => void
}

const Ctx = createContext<CookieConsentCtx>({ openBanner: () => {} })
export const useCookieConsent = () => useContext(Ctx)

const STORAGE_KEY = "gef_cookie_consent"

function loadPrefs(): CookiePrefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function savePrefs(prefs: CookiePrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {}
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"mini" | "full">("mini")
  const [prefs, setPrefs] = useState<CookiePrefs>({
    necessary: true,
    personalization: true,
    marketing: true,
    analytics: true,
  })

  useEffect(() => {
    const saved = loadPrefs()
    if (!saved) {
      setMode("mini")
      setOpen(true)
    } else {
      setPrefs(saved)
    }
  }, [])

  const openBanner = useCallback(() => {
    setMode("full")
    setOpen(true)
  }, [])

  function acceptAll() {
    const p: CookiePrefs = { necessary: true, personalization: true, marketing: true, analytics: true }
    savePrefs(p)
    setPrefs(p)
    setOpen(false)
  }

  function rejectAll() {
    const p: CookiePrefs = { necessary: true, personalization: false, marketing: false, analytics: false }
    savePrefs(p)
    setPrefs(p)
    setOpen(false)
  }

  function saveChoices() {
    savePrefs(prefs)
    setOpen(false)
  }

  function toggle(key: keyof Omit<CookiePrefs, "necessary">) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const categories: { key: keyof Omit<CookiePrefs, "necessary"> | "necessary"; label: string; description: string; required?: boolean }[] = [
    {
      key: "necessary",
      label: "Necessario",
      description: "Questi cookie sono necessari per il corretto funzionamento del sito, comprese funzionalità come l'accesso e l'aggiunta di articoli al carrello.",
      required: true,
    },
    {
      key: "personalization",
      label: "Personalizzazione",
      description: "Questi cookie memorizzano dettagli sulle tue azioni per personalizzare la tua prossima visita al sito.",
    },
    {
      key: "marketing",
      label: "Marketing",
      description: "Utilizziamo questi cookie per ottimizzare le comunicazioni di marketing e mostrarti annunci pertinenti su altri siti web.",
    },
    {
      key: "analytics",
      label: "Analisi",
      description: "Questi cookie ci aiutano a capire come interagisci con il sito. Utilizziamo questi dati per identificare le aree da migliorare.",
    },
  ]

  return (
    <Ctx.Provider value={{ openBanner }}>
      {children}

      {open && mode === "mini" && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-5 py-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Cookie e privacy</p>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Utilizziamo i cookie per migliorare la tua esperienza. Puoi scegliere quali accettare.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={acceptAll}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
              >
                Accetta tutti
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Rifiuta
              </button>
              <button
                onClick={() => setMode("full")}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 transition-colors"
              >
                Personalizza
              </button>
            </div>
          </div>
        </div>
      )}

      {open && mode === "full" && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-gray-200">
              <p className="font-semibold text-gray-900 flex-1 text-base">Preferenze per cookie e privacy</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={acceptAll}
                  className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-800 hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Accetta tutti
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-800 hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Rifiuta tutto
                </button>
                <button
                  onClick={saveChoices}
                  className="px-4 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-800 hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Salva le mie scelte
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                  aria-label="Chiudi"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Sei tu a controllare i tuoi dati</p>
                <p className="text-sm text-gray-600">Scopri di più sui cookie che utilizziamo e scegli quali cookie consentire.</p>
              </div>

              <div className="divide-y divide-gray-100">
                {categories.map(({ key, label, description, required }) => {
                  const checked = key === "necessary" ? true : prefs[key as keyof Omit<CookiePrefs, "necessary">]
                  return (
                    <div key={key} className="flex items-start gap-4 py-4">
                      <div className="mt-0.5">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          disabled={required}
                          onClick={() => !required && toggle(key as keyof Omit<CookiePrefs, "necessary">)}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            required
                              ? "bg-gray-200 border-gray-300 cursor-default"
                              : checked
                              ? "bg-gray-900 border-gray-900"
                              : "bg-white border-gray-300 hover:border-gray-500"
                          }`}
                        >
                          {checked && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm mb-0.5">{label}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
