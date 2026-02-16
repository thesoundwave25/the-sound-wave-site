export const metadata = {
  title: "Privacy Policy | The Sound Wave",
  description: "Informativa privacy del sito The Sound Wave.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-24">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Privacy Policy
        </h1>

        <div className="mt-8 space-y-6 text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-white text-lg font-semibold">
              Titolare del trattamento
            </h2>
            <p>
              The Sound Wave – Contatto:{" "}
              <a
                className="underline underline-offset-4"
                href="mailto:thesoundwave25@gmail.com"
              >
                thesoundwave25@gmail.com
              </a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-white text-lg font-semibold">
              Dati trattati e finalità
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <b>Dati di navigazione</b>: informazioni tecniche (es. tipo
                dispositivo/browser, pagine visitate) per far funzionare il sito e
                per sicurezza.
              </li>
              <li>
                <b>Statistiche di utilizzo</b>: utilizziamo Vercel Web Analytics
                per statistiche aggregate sulle visite. Il servizio è progettato
                per funzionare senza cookie e senza profilazione.
              </li>
              <li>
                <b>Contatti</b>: se ci scrivi via email o ci contatti su
                WhatsApp/Instagram, tratteremo i dati che ci invii solo per
                rispondere e gestire la richiesta.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-white text-lg font-semibold">Base giuridica</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Esecuzione di misure precontrattuali/contrattuali (rispondere alle
                richieste).
              </li>
              <li>
                Legittimo interesse (sicurezza del sito e statistiche aggregate,
                senza profilazione), nei limiti applicabili.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-white text-lg font-semibold">
              Condivisione e trasferimenti
            </h2>
            <p>
              Il sito è ospitato su infrastruttura Vercel; alcune informazioni
              tecniche possono essere trattate da fornitori tecnici per erogare il
              servizio.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-white text-lg font-semibold">Conservazione</h2>
            <p>
              I dati dei contatti vengono conservati per il tempo necessario a
              gestire la richiesta e per eventuali obblighi di legge. Le statistiche
              sono trattate in forma aggregata secondo le logiche del servizio.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-white text-lg font-semibold">Diritti</h2>
            <p>
              Puoi chiedere accesso, rettifica, cancellazione, limitazione,
              opposizione e portabilità scrivendo a{" "}
              <a
                className="underline underline-offset-4"
                href="mailto:thesoundwave25@gmail.com"
              >
                thesoundwave25@gmail.com
              </a>
              . Se ritieni violati i tuoi diritti puoi proporre reclamo al Garante
              per la Protezione dei Dati Personali.
            </p>
          </section>

          <p className="text-zinc-400 text-sm">
            Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}
          </p>
        </div>
      </div>
    </main>
  );
}
