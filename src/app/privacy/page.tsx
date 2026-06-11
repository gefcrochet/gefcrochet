import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export const metadata = {
  title: "Informativa sulla privacy — GeF Crochet",
  description: "Come GeF Crochet raccoglie, utilizza e protegge le tue informazioni personali.",
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="font-newsreader text-3xl font-semibold text-on-surface mb-2">Informativa sulla privacy</h1>
        <p className="text-sm text-on-surface-variant mb-10">Ultimo aggiornamento: 19 maggio 2025</p>

        <div className="prose prose-sm max-w-none text-on-surface space-y-8">

          <p className="text-on-surface-variant leading-relaxed">
            {`La presente Informativa sulla privacy descrive come GeF Crochet (il "Sito", "noi", "ci" o "nostro") raccoglie, utilizza e divulga le tue informazioni personali quando visiti, utilizzi i nostri servizi o effettui un acquisto da gefcrochet.it (il "Sito") o comunichi in altro modo con noi in merito al Sito (collettivamente, i "Servizi"). Ai fini della presente Informativa sulla privacy, "tu" e "tuo" indicano te come utente dei Servizi, che tu sia un cliente, un visitatore del sito web o un altro individuo di cui abbiamo raccolto le informazioni ai sensi della presente Informativa sulla privacy.`}
          </p>
          <p className="text-on-surface-variant leading-relaxed">Si prega di leggere attentamente la presente Informativa sulla privacy.</p>

          <Section title="Modifiche alla presente Informativa sulla privacy">
            Potremmo aggiornare la presente Informativa sulla privacy di tanto in tanto, anche per riflettere modifiche alle nostre pratiche o per altri motivi operativi, legali o normativi. Pubblicheremo l&apos;Informativa sulla privacy rivista sul Sito, aggiorneremo la data &quot;Ultimo aggiornamento&quot; e adotteremo qualsiasi altra misura richiesta dalla legge applicabile.
          </Section>

          <Section title="Come raccogliamo e utilizziamo le tue informazioni personali">
            Per fornire i Servizi, raccogliamo informazioni personali su di te provenienti da una varietà di fonti, come indicato di seguito. Le informazioni che raccogliamo e utilizziamo variano a seconda di come interagisci con noi.
            <br /><br />
            Oltre agli usi specifici indicati di seguito, potremmo usare le informazioni che raccogliamo su di te per comunicare con te, fornire o migliorare i Servizi, rispettare eventuali obblighi legali applicabili, far rispettare eventuali termini di servizio applicabili e proteggere o difendere i Servizi, i nostri diritti e i diritti dei nostri utenti o di altri.
          </Section>

          <Section title="Quali informazioni personali raccogliamo">
            <p className="mb-3">I tipi di informazioni personali che otteniamo su di te dipendono da come interagisci con il nostro Sito e usi i nostri Servizi. Le sezioni seguenti descrivono le categorie e i tipi specifici di informazioni personali che raccogliamo.</p>
            <Subsection title="Informazioni che raccogliamo direttamente da te">
              Le informazioni che ci invii direttamente tramite i nostri Servizi possono includere:
              <ul className="list-disc pl-5 mt-2 space-y-1 text-on-surface-variant">
                <li>Recapiti tra cui nome, indirizzo, numero di telefono ed email.</li>
                <li>Informazioni sull&apos;ordine inclusi nome, indirizzo di fatturazione, indirizzo di spedizione, conferma di pagamento, indirizzo email e numero di telefono.</li>
                <li>Informazioni sull&apos;account inclusi nome utente, password e altre informazioni utilizzate per scopi di sicurezza dell&apos;account.</li>
                <li>Informazioni sull&apos;assistenza clienti incluse le informazioni che scegli di includere nelle comunicazioni con noi.</li>
              </ul>
            </Subsection>
            <Subsection title="Informazioni che raccogliamo sul tuo utilizzo">
              {`Potremmo raccogliere automaticamente determinate informazioni sulla tua interazione con i Servizi ("Dati di utilizzo"). A tale scopo, potremmo utilizzare cookie, pixel e tecnologie simili. I dati di utilizzo possono includere informazioni su come accedi e utilizzi il nostro Sito, informazioni sul dispositivo, informazioni sul browser, il tuo indirizzo IP e altre informazioni relative alla tua interazione con i Servizi.`}
            </Subsection>
            <Subsection title="Informazioni che otteniamo da terze parti">
              Potremmo ottenere informazioni su di te da terze parti, inclusi fornitori di servizi che raccolgono informazioni per nostro conto, come elaboratori di pagamento e fornitori di analisi dei dati. Qualsiasi informazione che otteniamo da terze parti sarà trattata in conformità con la presente Informativa sulla privacy.
            </Subsection>
          </Section>

          <Section title="Come utilizziamo le tue informazioni personali">
            <ul className="list-disc pl-5 space-y-3 text-on-surface-variant">
              <li><strong className="text-on-surface">Fornitura di prodotti e servizi.</strong> Utilizziamo le tue informazioni personali per fornirti i Servizi, incluso elaborare i tuoi ordini, inviarti notifiche relative al tuo account, creare e gestire il tuo account, e organizzare la spedizione.</li>
              <li><strong className="text-on-surface">Marketing e pubblicità.</strong> Potremmo utilizzare le tue informazioni personali per scopi promozionali, come inviare comunicazioni di marketing via email. Se risiedi nel SEE, la base giuridica è il nostro legittimo interesse ai sensi dell&apos;art. 6 (1) (f) GDPR.</li>
              <li><strong className="text-on-surface">Sicurezza e prevenzione delle frodi.</strong> Utilizziamo le tue informazioni per rilevare e prevenire attività fraudolente o illegali. Se risiedi nel SEE, la base giuridica è il legittimo interesse ai sensi dell&apos;art. 6 (1) (f) GDPR.</li>
              <li><strong className="text-on-surface">Comunicazione e miglioramento del servizio.</strong> Utilizziamo le tue informazioni per fornirti assistenza clienti e migliorare i nostri Servizi, nel nostro legittimo interesse ai sensi dell&apos;art. 6 (1) (f) GDPR.</li>
            </ul>
          </Section>

          <Section title="Cookie">
            Utilizziamo i cookie per gestire e migliorare il nostro Sito e i nostri Servizi, anche per ricordare le tue azioni e preferenze, per eseguire analisi e comprendere meglio l&apos;interazione dell&apos;utente con i Servizi. Potremmo anche consentire a terze parti di utilizzare cookie sul nostro Sito per personalizzare meglio i servizi e la pubblicità.
            <br /><br />
            La maggior parte dei browser accetta automaticamente i cookie per impostazione predefinita, ma puoi scegliere di impostare il tuo browser per rimuovere o rifiutare i cookie. Tieni presente che la rimozione o il blocco dei cookie può avere un impatto negativo sulla tua esperienza utente e potrebbe comportare il funzionamento errato di alcuni Servizi.
          </Section>

          <Section title="Come divulghiamo le tue informazioni personali">
            In determinate circostanze, potremmo divulgare le tue informazioni personali a terze parti, tra cui:
            <ul className="list-disc pl-5 mt-2 space-y-1 text-on-surface-variant">
              <li>Fornitori di servizi che eseguono servizi per nostro conto (gestione IT, elaborazione dei pagamenti, analisi dei dati, assistenza clienti, archiviazione cloud, evasione ordini e spedizione).</li>
              <li>Partner commerciali e di marketing, che utilizzeranno le tue informazioni in conformità con le proprie informative sulla privacy.</li>
              <li>Quando ci autorizzi espressamente a condividere determinate informazioni con terze parti.</li>
              <li>In relazione a una transazione commerciale, per rispettare obblighi legali applicabili o per proteggere i nostri diritti e quelli dei nostri utenti.</li>
            </ul>
            <br />
            Non utilizziamo né divulghiamo informazioni personali sensibili senza il tuo consenso.
          </Section>

          <Section title="Siti web e link di terze parti">
            Il nostro Sito può contenere collegamenti a siti web gestiti da terze parti. Se segui tali link, ti invitiamo a consultare le relative informative sulla privacy. Non siamo responsabili per la privacy o la sicurezza di tali siti.
          </Section>

          <Section title="Dati dei bambini">
            I Servizi non sono destinati ai bambini e non raccogliamo consapevolmente informazioni personali su minori. Se sei il genitore o tutore di un bambino che ci ha fornito le sue informazioni personali, puoi contattarci per richiederne la cancellazione.
          </Section>

          <Section title="Sicurezza e conservazione delle tue informazioni">
            Nessuna misura di sicurezza è perfetta o impenetrabile. Ti consigliamo di non utilizzare canali non sicuri per comunicarci informazioni sensibili. Conserviamo le tue informazioni personali per il tempo necessario a fornire i Servizi, rispettare gli obblighi legali, risolvere controversie e applicare i nostri accordi.
          </Section>

          <Section title="I tuoi diritti">
            A seconda di dove vivi, potresti avere i seguenti diritti in relazione alle tue informazioni personali:
            <ul className="list-disc pl-5 mt-2 space-y-1 text-on-surface-variant">
              <li><strong className="text-on-surface">Accesso/conoscenza:</strong> richiedere l&apos;accesso alle informazioni personali che conserviamo su di te.</li>
              <li><strong className="text-on-surface">Cancellazione:</strong> richiedere la cancellazione delle tue informazioni personali.</li>
              <li><strong className="text-on-surface">Rettifica:</strong> richiedere la correzione di informazioni personali imprecise.</li>
              <li><strong className="text-on-surface">Portabilità:</strong> ricevere una copia delle tue informazioni personali.</li>
              <li><strong className="text-on-surface">Opposizione alla vendita o alla pubblicità mirata:</strong> richiedere che le tue informazioni non vengano utilizzate per scopi di pubblicità mirata.</li>
              <li><strong className="text-on-surface">Limitazione del trattamento:</strong> richiedere di interrompere o limitare il trattamento dei tuoi dati personali.</li>
              <li><strong className="text-on-surface">Revoca del consenso:</strong> revocare il consenso al trattamento dei tuoi dati personali.</li>
            </ul>
            <br />
            Puoi esercitare questi diritti contattandoci agli indirizzi indicati di seguito. Non ti discrimineremo per aver esercitato uno qualsiasi di questi diritti.
          </Section>

          <Section title="Reclami">
            In caso di reclami su come trattiamo i tuoi dati personali, contattaci agli indirizzi indicati di seguito. Se non sei soddisfatto della nostra risposta, puoi presentare reclamo all&apos;autorità locale per la protezione dei dati. Per lo SEE, puoi trovare l&apos;elenco delle autorità di controllo sul sito del Comitato europeo per la protezione dei dati.
          </Section>

          <Section title="Utenti internazionali">
            Tieni presente che potremmo trasferire, archiviare ed elaborare le tue informazioni personali al di fuori del Paese in cui vivi. Se trasferiamo le tue informazioni personali fuori dall&apos;Europa, faremo affidamento su meccanismi di trasferimento riconosciuti come le clausole contrattuali standard della Commissione Europea.
          </Section>

          <Section title="Contatto">
            In caso di domande sulla presente Informativa sulla privacy o se desideri esercitare uno qualsiasi dei tuoi diritti, contattaci:
            <br /><br />
            <strong className="text-on-surface">Email:</strong>{" "}
            <a href="mailto:info@gefcrochet.it" className="text-primary hover:underline">info@gefcrochet.it</a>
            <br />
            <strong className="text-on-surface">Indirizzo:</strong> Via di Valle Muricana 54, Roma, RM, 00188, IT
            <br /><br />
            Ai fini delle leggi applicabili sulla protezione dei dati, GeF Crochet è il titolare del trattamento dei dati personali.
          </Section>

        </div>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-newsreader text-xl font-semibold text-on-surface mb-3">{title}</h2>
      <div className="text-sm text-on-surface-variant leading-relaxed">{children}</div>
    </div>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold text-on-surface text-sm mb-1">{title}</h3>
      <div className="text-sm text-on-surface-variant leading-relaxed">{children}</div>
    </div>
  )
}
