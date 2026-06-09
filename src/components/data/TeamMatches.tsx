"use client";

import { MatchRow } from "@/components/data/MatchRow";
import { useSettings } from "@/components/providers/SettingsProvider";
import type { Match } from "@/lib/schemas";

interface TeamMatchesProps {
  matches: Match[];
}

export function TeamMatches({ matches }: TeamMatchesProps) {
  const { settings } = useSettings();

  const sorted = [...matches].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  );

  return (
    <ul className="space-y-3">
      {sorted.map((match) => (
        <li key={match.id}>
          <MatchRow
            match={match}
            timezone={settings.timezone}
            spoilerMode={settings.spoilerMode}
          />
        </li>
      ))}
    </ul>
  );
}
