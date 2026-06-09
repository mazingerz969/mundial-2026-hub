import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-text-secondary">No encontramos esta página.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-accent-green px-4 py-2 text-sm font-medium text-bg-primary"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
