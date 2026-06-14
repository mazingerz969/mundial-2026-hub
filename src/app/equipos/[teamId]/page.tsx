import Link from "next/link";
import { notFound } from "next/navigation";

import { SquadList } from "@/components/data/SquadList";
import { TeamHero } from "@/components/data/TeamHero";
import { TeamMatchesLive } from "@/components/data/TeamMatchesLive";
import { getPlayersByTeamId, getTeamById } from "@/lib/data";

interface TeamPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function TeamDetailPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const team = getTeamById(teamId);

  if (!team) {
    notFound();
  }

  const squad = getPlayersByTeamId(teamId);

  return (
    <div className="space-y-8">
      <Link
        href="/equipos"
        className="inline-block text-sm text-accent-green hover:underline"
      >
        ← Volver a equipos
      </Link>

      <TeamHero team={team} squadCount={squad.length} />

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Plantilla{squad.length > 0 ? ` (${squad.length})` : ""}
        </h2>
        <SquadList players={squad} />
      </section>

      {squad.length >= 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Partidos</h2>
          <TeamMatchesLive teamId={teamId} />
        </section>
      )}
    </div>
  );
}
