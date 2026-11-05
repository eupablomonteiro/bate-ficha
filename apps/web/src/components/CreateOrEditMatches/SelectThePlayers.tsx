import React from "react";
import { CrosshairIcon } from "lucide-react";

const SelectThePlayers = () => {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="pt-4 border-t-2 border-zinc-800 flex gap-2 items-center text-md">
        <CrosshairIcon size={24} /> Escolha os Jogadores
      </h4>
      <p className="text-sm text-zinc-500">
        Clique em cima das opções abaixo e depois selecione o jogador para
        preencher a posição.
      </p>
    </div>
  );
};

export default SelectThePlayers;
