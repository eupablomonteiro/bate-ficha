"use client";

import Image from "next/image";
import CaraACara from "@/assets/cara-a-cara.png";
import Parceirada from "@/assets/parceirada.png";

interface GameModeSelectorProps {
  selectedGameMode: string | null;
  selectedGameType: string | null;
  onSelect: (gameMode: string) => void;
}

const GAME_MODES = [
  {
    value: "cara_a_cara",
    label: "Cara a Cara",
    image: CaraACara,
  },
  {
    value: "parceirada",
    label: "Parceirada",
    image: Parceirada,
  },
];

export const GameModeSelector = ({
  selectedGameMode,
  selectedGameType,
  onSelect,
}: GameModeSelectorProps) => {
  return (
    <>
      {GAME_MODES.map((gameMode) => (
        <div
          key={gameMode.value}
          onClick={() => {
            if (selectedGameType === "bolinho" && gameMode.value === "parceirada") {
              return;
            }
            onSelect(gameMode.value);
          }}
          className={`flex flex-col justify-center items-center bg-zinc-800 gap-2 p-4 rounded cursor-pointer ${
            selectedGameMode === gameMode.value
              ? "text-zinc-200"
              : "opacity-50 hover:opacity-75"
          } ${
            selectedGameType === "bolinho" && gameMode.value === "parceirada"
              ? "cursor-not-allowed opacity-20"
              : ""
          }`}
        >
          <Image
            src={gameMode.image}
            width={56}
            height={56}
            className="w-14 h-14"
            alt={`partida de ${gameMode.label}`}
          />
          <span>{gameMode.label}</span>
        </div>
      ))}
    </>
  );
}; 