type Props = {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function Section({ id, title, subtitle, children }: Props) {
  return (
    <section id={id} className="scroll-mt-40 mx-auto w-full max-w-6xl px-6 py-16">
      <header className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-2 text-zinc-400">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
