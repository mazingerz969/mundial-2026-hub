"use client";

import { TeamMatches } from "@/components/data/TeamMatches";
import { useLiveMatches } from "@/components/providers/LiveDataProvider";
import { filterMatchesByTeamId } from "@/lib/data/live";

interface TeamMatchesLiveProps {
  teamId: string;
}

export function TeamMatchesLive({ teamId }: TeamMatchesLiveProps) {
  const matches = useLiveMatches();
  const teamMatches = filterMatchesByTeamId(matches, teamId);

  return <TeamMatches matches={teamMatches} />;
}
