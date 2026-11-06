"use client";

// Globals
import React from "react";
import api from "@/services/api";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

// hoc
import withAuth from "@/hoc/withAuth";

// Components
import { PlayerHeader } from "@/components/profileComponents/PlayerHeader";
import { HeaderSkeleton } from "@/components/profileComponents/PlayerHeader/skeleton";
import { PlayerStats } from "@/components/profileComponents/PlayerStats";
import { SummarySkeleton } from "@/components/profileComponents/PlayerStats/skeleton";
import { BestPartner } from "@/components/profileComponents/BestPartner";
import { BestPartnerSkeleton } from "@/components/profileComponents/BestPartner/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

const fetchPlayerByNickname = async (nickname: string) => {
  const response = await api.get(`/player/getNick/${nickname}`);
  return response.data;
};

const PlayerProfile = () => {
  const { nickname } = useParams<{ nickname: string }>();

  const {
    data: player,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["playerFetchedByParams", nickname],
    queryFn: () => fetchPlayerByNickname(nickname),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <HeaderSkeleton />
        <div className="flex flex-col gap-4 p-2">
          <SummarySkeleton />
          <SummarySkeleton />
          <SummarySkeleton />
        </div>
        <BestPartnerSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <>
        <p className="px-4 py-2 text-red-500">
          {getApiErrorMessage(error, "Erro ao carregar o perfil.")}
        </p>
      </>
    );
  }

  if (!player) {
    return (
      <>
        <p>Jogador não encontrado.</p>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <PlayerHeader player={player} isLoading={isLoading} />

        <div className="flex flex-col gap-4 p-2">
          <PlayerStats
            data={player}
            gamemode="cara_a_cara"
            isLoading={isLoading}
          />
          <PlayerStats
            data={player}
            gamemode="parceirada"
            isLoading={isLoading}
          />
          <PlayerStats data={player} isLoading={isLoading} generalStatics />
        </div>

        <BestPartner playerId={player._id} />
      </div>
    </>
  );
};

export default withAuth(PlayerProfile);
