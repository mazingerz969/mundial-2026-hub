import Link from "next/link";
import { notFound } from "next/navigation";

import { PlayerProfile } from "@/components/data/PlayerProfile";
import {
  fetchPlayerEnrichment,
  mergePlayerWithEnrichment,
} from "@/lib/data/fetch-player-enrichment";
import { getPlayerById, getTeamById } from "@/lib/data";

interface PlayerPageProps {
  params: Promise<{ teamId: string; playerId: string }>;
}

export default async function PlayerDetailPage({ params }: PlayerPageProps) {
  const { teamId, playerId } = await params;
  const team = getTeamById(teamId);
  const player = getPlayerById(playerId);

  if (!team || !player || player.teamId !== teamId) {
    notFound();
  }

  const enrichment = await fetchPlayerEnrichment(playerId);
  const displayPlayer = mergePlayerWithEnrichment(player, enrichment);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/equipos"
          className="text-accent-green hover:underline"
        >
          ← Equipos
        </Link>
        <span className="text-text-secondary">/</span>
        <Link
          href={`/equipos/${team.id}`}
          className="text-accent-green hover:underline"
        >
          {team.name}
        </Link>
      </div>

      <PlayerProfile player={displayPlayer} />
    </div>
  );
}
