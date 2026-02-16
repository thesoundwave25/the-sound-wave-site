export const metadata = {
  title: "Cookie Policy | The Sound Wave",
  description: "Informativa cookie del sito The Sound Wave.",
};

export default function CookiePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-24">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Cookie Policy
        </h1>

        <div className="mt-8 space-y-6 text-zinc-300 leading-relaxed">
          <section className="space-y-2">
            <p>
              Questo sito utilizza solo cookie <b>tecnici</b> necessari al corretto
              funzionamento e alla sicurezza.
            </p>
            <p>
              Utilizziamo inoltre <b>Vercel Web Analytics</b> per ottenere
              statistiche aggregate sulle visite. Vercel Web Analytics è progettato
              per funzionare <b>senza cookie</b> e senza profilazione degli utenti.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-white text-lg font-semibold">Link esterni</h2>
            <p>
              Cliccando sui link a <b>WhatsApp</b> e <b>Instagram</b> potresti
              essere reindirizzato a servizi di terze parti che operano con proprie
              informative e tecnologie (anche cookie). Ti invitiamo a consultare le
              loro policy.
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
