import { CalendarioView } from "@/components/data/CalendarioView";

interface CalendarioPageProps {
  searchParams: Promise<{ match?: string; venue?: string }>;
}

export default async function CalendarioPage({ searchParams }: CalendarioPageProps) {
  const params = await searchParams;

  return (
    <CalendarioView
      initialMatchId={params.match ?? null}
      initialVenueId={params.venue ?? null}
    />
  );
}
