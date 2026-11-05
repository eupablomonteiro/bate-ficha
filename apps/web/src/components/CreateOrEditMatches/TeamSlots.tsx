"use client";

import { PlayerSlot } from "./PlayerSlot";
import { SimplePlayer } from "@/types/match";

interface TeamSlotsProps {
  team: "teamA" | "teamB";
  players: (SimplePlayer | null)[];
  selectedSlot: {
    team: "teamA" | "teamB";
    position: number;
  } | null;
  onSelectSlot: (team: "teamA" | "teamB", position: number) => void;
  onRemovePlayer: (team: "teamA" | "teamB", position: number) => void;
  slotsCount: number;
}

export const TeamSlots = ({
  team,
  players,
  selectedSlot,
  onSelectSlot,
  onRemovePlayer,
  slotsCount,
}: TeamSlotsProps) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: slotsCount }).map((_, position) => {
        const player = players[position] || null;
        const isSelected =
          selectedSlot?.team === team && selectedSlot.position === position;

        return (
          <PlayerSlot
            key={`${team}-${position}`}
            player={player}
            position={position}
            team={team}
            isSelected={isSelected}
            onSelect={() => onSelectSlot(team, position)}
            onRemove={() => onRemovePlayer(team, position)}
          />
        );
      })}
    </div>
  );
};
