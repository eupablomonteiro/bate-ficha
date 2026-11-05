"use client";

import Image from "next/image";
import { CircleXIcon } from "lucide-react";
import { SimplePlayer } from "@/types/match";
import useStringUtils from "@/hooks/useStringUtils";

interface PlayerSlotProps {
  player: SimplePlayer | null;
  position: number;
  team: "teamA" | "teamB";
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export const PlayerSlot = ({
  player,
  position,
  team,
  isSelected,
  onSelect,
  onRemove,
}: PlayerSlotProps) => {
  const { limitNickname } = useStringUtils();
  return (
    <div
      className={`flex items-center gap-2 rounded p-2 ${
        isSelected ? "bg-zinc-800" : "bg-zinc-900"
      }`}
      onClick={onSelect}
    >
      {player ? (
        <>
          <div className="min-w-10 min-h-10 relative">
            <Image
              src={player.avatarUrl}
              fill
              alt={player.nickname}
              className="rounded-full object-cover object-center"
            />
          </div>
          <p className="text-sm text-zinc-400">@{limitNickname(player.nickname, 5)}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="ml-auto text-red-500 hover:text-red-400"
          >
            <CircleXIcon size={24} />
          </button>
        </>
      ) : (
        <div className="w-full flex items-center justify-start gap-2">
          <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse flex items-center justify-center text-2xl">
            ?
          </div>
          <div className="flex flex-col gap-2">
            <span className="w-20 h-3 rounded bg-zinc-700 animate-pulse"></span>
          </div>
        </div>
      )}
    </div>
  );
};