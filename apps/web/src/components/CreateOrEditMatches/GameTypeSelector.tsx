"use client";

import Image from "next/image";
import BolinhoGame from "@/assets/de-bilhar_bolinho.png";
import ParOuImparGame from "@/assets/de-bilhar_par-ou-impar.png";

interface GameTypeSelectorProps {
  selectedGameType: string | null;
  onSelect: (gameType: string) => void;
}

const GAME_TYPES = [
  {
    value: "bolinho",
    label: "Bolinho",
    image: BolinhoGame,
  },
  {
    value: "par_ou_impar",
    label: "Par ou Ímpar",
    image: ParOuImparGame,
  },
];

export const GameTypeSelector = ({
  selectedGameType,
  onSelect,
}: GameTypeSelectorProps) => {
  return (
    <>
      {GAME_TYPES.map((gameType) => (
        <div
          key={gameType.value}
          onClick={() => onSelect(gameType.value)}
          className={`flex flex-col justify-center items-center bg-zinc-800 gap-2 p-4 rounded cursor-pointer ${
            selectedGameType === gameType.value
              ? "text-zinc-200"
              : "opacity-50 hover:opacity-75"
          }`}
        >
          <Image
            src={gameType.image}
            width={56}
            height={56}
            className="w-14 h-14"
            alt={`partida de ${gameType.label}`}
          />
          <span>{gameType.label}</span>
        </div>
      ))}
    </>
  );
};
