"use client";

import Image from "next/image";
import { SimplePlayer } from "@/types/match";

interface PlayerSelectionProps {
  players: SimplePlayer[];
  onSelectPlayer: (playerId: string) => void;
  isPlayerSelected: (playerId: string) => boolean;
}

export const PlayerSelection = ({
  players,
  onSelectPlayer,
  isPlayerSelected,
}: PlayerSelectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1">
        <div className="flex flex-wrap justify-between gap-2">
          {players.map((player) => (
            <button
              key={player._id}
              type="button"
              onClick={() => onSelectPlayer(player._id)}
              disabled={isPlayerSelected(player._id)}
              className={`relative w-14 h-14 rounded-full overflow-hidden ${
                isPlayerSelected(player._id)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-110 transition-transform"
              }`}
            >
              <Image
                src={player.avatarUrl}
                fill
                alt={player.nickname}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 