import Link from "next/link";

interface PlaceholderPageProps {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  phase?: string;
}

export function PlaceholderPage({
  title,
  description,
  backHref,
  backLabel,
  phase,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-lg space-y-6 py-8 text-center">
      <Link
        href={backHref}
        className="inline-block text-sm text-accent-green hover:underline"
      >
        ← {backLabel}
      </Link>
      <div className="rounded-2xl border border-border bg-bg-secondary p-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-text-secondary">{description}</p>
        {phase && (
          <p className="mt-4 inline-block rounded-full bg-bg-elevated px-3 py-1 text-xs text-accent-gold">
            Próximamente — {phase}
          </p>
        )}
      </div>
    </div>
  );
}
