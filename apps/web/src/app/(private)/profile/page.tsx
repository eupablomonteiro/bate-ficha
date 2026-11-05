"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Components
import { BestPartner } from "@/components/profileComponents/BestPartner";
import { PlayerHeader } from "@/components/profileComponents/PlayerHeader";
import { PlayerStats } from "@/components/profileComponents/PlayerStats";
import { EditProfileModal } from "@/components/profileComponents/EditProfileModal";

// Contexts and Hooks
import { useAuth } from "@/context/AuthContext";

// Services
import { fetchPlayerProfile, fecthLastFiveMatchesByGamemode } from "@/services/api";

// Utils
import withAuth from "@/hoc/withAuth";
import PrivateLayout from "@/layouts/PrivateLayout";

const Profile = () => {
  const { player, updatePlayer } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: playerData, isLoading: isPlayerLoading } = useQuery({
    queryKey: ["player", player?._id],
    queryFn: () => fetchPlayerProfile(player?._id),
    enabled: !!player?._id,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    initialData: player,
  });

  const { data: lastFiveMatches, isError } = useQuery({
      queryKey: ["lastMatches", player?._id],
      queryFn: () => fecthLastFiveMatchesByGamemode("cara_a_cara"),
    });

  if (!player) return null;

  return (
    <PrivateLayout>
      <div className="flex flex-col gap-2">
        <PlayerHeader
          player={playerData}
          isLoading={isPlayerLoading}
          onEditProfile={() => setIsModalOpen(true)}
        />

        <div className="flex flex-col gap-4 px-4 py-2">
          <PlayerStats
            data={playerData}
            isLoading={isPlayerLoading}
            gamemode="cara_a_cara"
          />

          <PlayerStats
            data={playerData}
            isLoading={isPlayerLoading}
            gamemode="parceirada"
          />

          <PlayerStats
            data={playerData}
            isLoading={isPlayerLoading}
            generalStatics
          />
        </div>

        <BestPartner playerId={player._id} />

        {isModalOpen && (
          <EditProfileModal
            player={playerData}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </PrivateLayout>
  );
};

export default withAuth(Profile);
