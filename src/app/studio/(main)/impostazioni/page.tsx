"use client"

import { useState, useEffect } from "react"
import { changePassword, getTotpStatus, setupTotp, enableTotp, disableTotp, getSmtpSettings, saveSmtpSettings, testSmtp, getGroqSettings, saveGroqSettings } from "@/app/actions/settings"

type TotpStep = "idle" | "setup" | "verify"

export default function ImpostazioniPage() {
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  const [totpEnabled, setTotpEnabled] = useState(false)
  const [totpStep, setTotpStep] = useState<TotpStep>("idle")
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [totpSecret, setTotpSecret] = useState<string | null>(null)
  const [totpError, setTotpError] = useState<string | null>(null)
  const [totpLoading, setTotpLoading] = useState(false)
  const [totpSuccess, setTotpSuccess] = useState<string | null>(null)

  // Groq state
  const [groqHasKey, setGroqHasKey] = useState(false)
  const [groqKey, setGroqKey] = useState("")
  const [groqSaving, setGroqSaving] = useState(false)
  const [groqSaved, setGroqSaved] = useState(false)
  const [groqError, setGroqError] = useState<string | null>(null)

  // SMTP state
  const [smtp, setSmtp] = useState({ host: "", port: 587, secure: false, user: "", from: "" })
  const [smtpPass, setSmtpPass] = useState("")
  const [smtpHasPass, setSmtpHasPass] = useState(false)
  const [smtpSaving, setSmtpSaving] = useState(false)
  const [smtpSaved, setSmtpSaved] = useState(false)
  const [smtpError, setSmtpError] = useState<string | null>(null)
  const [smtpTesting, setSmtpTesting] = useState(false)
  const [smtpTestResult, setSmtpTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    getTotpStatus().then(({ enabled }) => setTotpEnabled(enabled))
    getSmtpSettings().then((s) => {
      setSmtp({ host: s.host, port: s.port, secure: s.secure, user: s.user, from: s.from })
      setSmtpHasPass(s.hasPass)
    })
    getGroqSettings().then(({ hasKey }) => setGroqHasKey(hasKey))
  }, [])

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwLoading(true)
    setPwError(null)
    setPwSuccess(false)
    const result = await changePassword(new FormData(e.currentTarget))
    if (result.error) setPwError(result.error)
    else { setPwSuccess(true); (e.target as HTMLFormElement).reset() }
    setPwLoading(false)
  }

  async function handleSetupTotp() {
    setTotpLoading(true)
    setTotpError(null)
    const result = await setupTotp()
    if (result.error) { setTotpError(result.error); setTotpLoading(false); return }
    setQrDataUrl(result.qrDataUrl ?? null)
    setTotpSecret(result.secret ?? null)
    setTotpStep("setup")
    setTotpLoading(false)
  }

  async function handleEnableTotp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTotpLoading(true)
    setTotpError(null)
    const result = await enableTotp(new FormData(e.currentTarget))
    if (result.error) { setTotpError(result.error); setTotpLoading(false); return }
    setTotpEnabled(true)
    setTotpStep("idle")
    setTotpSuccess("Autenticazione a due fattori attivata.")
    setTotpLoading(false)
  }

  async function handleDisableTotp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTotpLoading(true)
    setTotpError(null)
    const result = await disableTotp(new FormData(e.currentTarget))
    if (result.error) { setTotpError(result.error); setTotpLoading(false); return }
    setTotpEnabled(false)
    setTotpStep("idle")
    setTotpSuccess("Autenticazione a due fattori disattivata.")
    setTotpLoading(false)
  }

  async function handleSaveGroq(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setGroqSaving(true)
    setGroqError(null)
    setGroqSaved(false)
    try {
      const fd = new FormData()
      fd.append("groqApiKey", groqKey)
      const result = await saveGroqSettings(fd)
      if (result.error) setGroqError(result.error)
      else {
        setGroqSaved(true)
        setGroqKey("")
        if (groqKey) setGroqHasKey(true)
        setTimeout(() => setGroqSaved(false), 2500)
      }
    } catch (err) {
      setGroqError((err as Error).message ?? "Errore sconosciuto")
    } finally {
      setGroqSaving(false)
    }
  }

  async function handleSaveSmtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSmtpSaving(true)
    setSmtpError(null)
    setSmtpSaved(false)
    const fd = new FormData()
    fd.append("smtpHost", smtp.host)
    fd.append("smtpPort", String(smtp.port))
    fd.append("smtpSecure", String(smtp.secure))
    fd.append("smtpUser", smtp.user)
    fd.append("smtpPass", smtpPass)
    fd.append("smtpFrom", smtp.from)
    const result = await saveSmtpSettings(fd)
    if (result.error) setSmtpError(result.error)
    else {
      setSmtpSaved(true)
      setSmtpPass("")
      if (smtpPass) setSmtpHasPass(true)
      setTimeout(() => setSmtpSaved(false), 2500)
    }
    setSmtpSaving(false)
  }

  async function handleTestSmtp() {
    setSmtpTesting(true)
    setSmtpTestResult(null)
    const result = await testSmtp()
    setSmtpTestResult(result.success
      ? { ok: true, msg: "Email di test inviata! Controlla la tua casella." }
      : { ok: false, msg: result.error ?? "Errore sconosciuto" }
    )
    setSmtpTesting(false)
  }

  return (
    <div className="p-6 max-w-lg space-y-8">
      <h1 className="text-xl font-semibold text-on-surface">Impostazioni</h1>

      {/* Password change */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-on-surface">Cambia password</h2>

        {pwSuccess && (
          <p className="text-sm text-on-primary-container bg-primary-container rounded-lg px-3 py-2">
            Password aggiornata con successo.
          </p>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="current">Password attuale</label>
            <input
              id="current" name="current" type="password" required
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="new">Nuova password</label>
            <input
              id="new" name="new" type="password" required minLength={8}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Almeno 8 caratteri"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="confirm">Conferma nuova password</label>
            <input
              id="confirm" name="confirm" type="password" required minLength={8}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {pwError && (
            <p className="text-sm text-error bg-error-container rounded-lg px-3 py-2">{pwError}</p>
          )}

          <button
            type="submit" disabled={pwLoading}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {pwLoading ? "Salvataggio…" : "Aggiorna password"}
          </button>
        </form>
      </section>

      {/* TOTP */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-on-surface">Autenticazione a due fattori</h2>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${totpEnabled ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant"}`}>
            {totpEnabled ? "Attiva" : "Inattiva"}
          </span>
        </div>

        {totpSuccess && (
          <p className="text-sm text-on-primary-container bg-primary-container rounded-lg px-3 py-2">{totpSuccess}</p>
        )}

        {totpError && (
          <p className="text-sm text-error bg-error-container rounded-lg px-3 py-2">{totpError}</p>
        )}

        {!totpEnabled && totpStep === "idle" && (
          <div className="space-y-3">
            <p className="text-sm text-on-surface-variant">
              Proteggi il tuo account con un codice generato dall&apos;app autenticatore (Google Authenticator, Authy, ecc.).
            </p>
            <button
              onClick={handleSetupTotp} disabled={totpLoading}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {totpLoading ? "Caricamento…" : "Configura autenticatore"}
            </button>
          </div>
        )}

        {totpStep === "setup" && qrDataUrl && (
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              Scansiona il codice QR con la tua app autenticatore, poi inserisci il codice a 6 cifre per confermare.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR Code TOTP" className="w-40 h-40 rounded-lg border border-outline-variant" />
            {totpSecret && (
              <p className="text-xs text-on-surface-variant break-all">
                Chiave manuale: <span className="font-mono">{totpSecret}</span>
              </p>
            )}
            <form onSubmit={handleEnableTotp} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="totp-code">Codice di verifica</label>
                <input
                  id="totp-code" name="code" type="text" inputMode="numeric"
                  pattern="[0-9 ]{6,7}" required autoComplete="one-time-code"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent tracking-widest text-center"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit" disabled={totpLoading}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {totpLoading ? "…" : "Attiva"}
              </button>
            </form>
            <button onClick={() => setTotpStep("idle")} className="text-sm text-on-surface-variant hover:text-primary">
              Annulla
            </button>
          </div>
        )}

        {totpEnabled && totpStep === "idle" && (
          <div className="space-y-3">
            <p className="text-sm text-on-surface-variant">
              Per disattivare l&apos;autenticazione a due fattori, inserisci la tua password.
            </p>
            <form onSubmit={handleDisableTotp} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-on-surface mb-1" htmlFor="disable-pw">Password</label>
                <input
                  id="disable-pw" name="password" type="password" required
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <button
                type="submit" disabled={totpLoading}
                className="bg-error text-on-error px-4 py-2 rounded-lg text-sm font-semibold hover:bg-error/90 transition-colors disabled:opacity-60"
              >
                {totpLoading ? "…" : "Disattiva"}
              </button>
            </form>
          </div>
        )}
      </section>

      {/* Groq AI */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
          <h2 className="text-base font-semibold text-on-surface">Intelligenza Artificiale</h2>
          {groqHasKey && (
            <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container">
              Configurata
            </span>
          )}
        </div>
        <p className="text-sm text-on-surface-variant">
          Chiave API <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Groq</a> per l&apos;assistente AI nella scrittura delle descrizioni prodotto e delle collezioni.
        </p>

        <form onSubmit={handleSaveGroq} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Chiave API Groq
              {groqHasKey && <span className="ml-2 text-xs text-on-surface-variant font-normal">(già configurata — lascia vuoto per non cambiarla)</span>}
            </label>
            <input
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder={groqHasKey ? "••••••••••••••••" : "gsk_…"}
              autoComplete="new-password"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>

          {groqError && (
            <p className="text-sm text-error bg-error-container rounded-lg px-3 py-2">{groqError}</p>
          )}

          <button
            type="submit"
            disabled={groqSaving}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {groqSaving ? "Salvataggio…" : groqSaved ? "Salvato ✓" : "Salva"}
          </button>
        </form>
      </section>

      {/* SMTP */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
          <h2 className="text-base font-semibold text-on-surface">Configurazione Email SMTP</h2>
        </div>
        <p className="text-sm text-on-surface-variant">
          Usata per inviare le email di recupero password e notifiche del sito. Lascia vuoto per usare le variabili d&apos;ambiente.
        </p>

        <form onSubmit={handleSaveSmtp} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-on-surface mb-1">Host SMTP</label>
              <input
                value={smtp.host}
                onChange={(e) => setSmtp((s) => ({ ...s, host: e.target.value }))}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Porta</label>
              <input
                type="number"
                value={smtp.port}
                onChange={(e) => setSmtp((s) => ({ ...s, port: parseInt(e.target.value) || 587 }))}
                placeholder="587"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Utente (email mittente)</label>
            <input
              type="email"
              value={smtp.user}
              onChange={(e) => setSmtp((s) => ({ ...s, user: e.target.value }))}
              placeholder="info@gefcrochet.it"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Password
              {smtpHasPass && <span className="ml-2 text-xs text-on-surface-variant font-normal">(già configurata — lascia vuoto per non cambiarla)</span>}
            </label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder={smtpHasPass ? "••••••••" : "Password SMTP"}
              autoComplete="new-password"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Indirizzo mittente (from)</label>
            <input
              value={smtp.from}
              onChange={(e) => setSmtp((s) => ({ ...s, from: e.target.value }))}
              placeholder="no-reply@gefcrochet.it"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={smtp.secure}
                onClick={() => setSmtp((s) => ({ ...s, secure: !s.secure }))}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${smtp.secure ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${smtp.secure ? "translate-x-[18px]" : "translate-x-0.5"}`} />
              </button>
              <span className="text-sm text-on-surface">SSL/TLS (porta 465)</span>
            </label>
          </div>

          {smtpError && (
            <p className="text-sm text-error bg-error-container rounded-lg px-3 py-2">{smtpError}</p>
          )}

          {smtpTestResult && (
            <p className={`text-sm rounded-lg px-3 py-2 ${smtpTestResult.ok ? "text-on-primary-container bg-primary-container" : "text-error bg-error-container"}`}>
              {smtpTestResult.msg}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={smtpSaving}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {smtpSaving ? "Salvataggio…" : smtpSaved ? "Salvato ✓" : "Salva"}
            </button>
            <button
              type="button"
              onClick={handleTestSmtp}
              disabled={smtpTesting}
              className="border border-outline-variant text-on-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              {smtpTesting ? "Invio…" : "Invia email di test"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
