"use client";

// Globals
import React from "react";
import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

// Contexts and Hooks
import useStringUtils from "@/hooks/useStringUtils";
import { useAuth } from "@/context/AuthContext";
import withAuth from "@/hoc/withAuth";
import { getApiErrorMessage } from "@/lib/api-error";

// Animations
import { motion } from "framer-motion";

// Components
import Title from "./title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkeletonRanking, SkeletonTabs } from "./skeleton";

interface RankingProps {
  _id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  pointsSolo: number;
  pointsTeam: number;
  totalMatchesSolo: number;
  totalMatchesTeam: number;
  totalPoints: number;
}

interface FollowedPlayerToRankingProps {
  message: string;
  ranking: RankingProps[];
}

const fetchFollowedPlayersByLoggedinPlayer = async () => {
  const response = await api.get("/player/ranking");
  return response.data;
};

const Ranking = () => {
  const { player } = useAuth();

  const {
    data: fetchPlayersToRanking,
    isLoading,
    isError,
    error,
  } = useQuery<FollowedPlayerToRankingProps>({
    queryKey: ["fetchPlayersToRanking", player?._id],
    queryFn: () => fetchFollowedPlayersByLoggedinPlayer(),
    staleTime: 1000 * 60 * 5,
    enabled: !!player?._id,
  });

  if (isLoading) {
    return (
      <>
        <div className="px-4 flex flex-col gap-4">
        <Title />
          <div className="flex flex-col gap-4">
          <SkeletonTabs />
          <SkeletonRanking />
          <SkeletonRanking />
          <SkeletonRanking />
          <SkeletonRanking />
          <SkeletonRanking />
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <p className="px-4 py-2 text-red-500">
          {getApiErrorMessage(error, "Algo deu errado ao carregar o ranking.")}
        </p>
      </>
    );
  }

  if (!fetchPlayersToRanking?.ranking?.length) {
    return (
      <>
        <div className="px-4 flex flex-col gap-4">
          <Title />
          <div className="flex flex-col gap-2 px-4 py-2">
            <p>
              {fetchPlayersToRanking?.message ??
                "Não há jogadores para exibir no ranking."}
            </p>
            <Link href="/add-friends" className="text-green-300 border-b w-fit">
              Seguir amigos?
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="px-4 flex flex-col gap-4">
        <Title />
        <Tabs defaultValue="solo" className="w-full flex flex-col gap-2">
          <TabsList className="grid w-full grid-cols-3 gap-1 bg-zinc-800 rounded-full">
            <TabsTrigger
              value="solo"
              className="bg-zinc-700 data-[state=active]:bg-green-700 data-[state=active]:text-zinc-200 text-zinc-500 rounded-full"
            >
              Solo
            </TabsTrigger>
            <TabsTrigger
              value="parceiradas"
              className="bg-zinc-700 data-[state=active]:bg-green-700 data-[state=active]:text-zinc-200 text-zinc-500 rounded-full"
            >
              Parceiradas
            </TabsTrigger>
            <TabsTrigger
              value="geral"
              className="bg-zinc-700 data-[state=active]:bg-green-700 data-[state=active]:text-zinc-200 text-zinc-500 rounded-full"
            >
              Geral
            </TabsTrigger>
          </TabsList>

          <TabsContent value="solo">
            <RankingList
              players={fetchPlayersToRanking.ranking}
              sortBy="pointsSolo"
            />
          </TabsContent>
          <TabsContent value="parceiradas">
            <RankingList
              players={fetchPlayersToRanking.ranking}
              sortBy="pointsTeam"
            />
          </TabsContent>
          <TabsContent value="geral">
            <RankingList
              players={fetchPlayersToRanking.ranking}
              sortBy="totalPoints"
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

const RankingList = ({
  players,
  sortBy,
}: {
  players: RankingProps[];
  sortBy: keyof RankingProps;
}) => {
  const { getShortName,limitNickname } = useStringUtils();
  const sortedPlayers = [...players].sort((a, b) => {
    const valueA = a[sortBy] as number;
    const valueB = b[sortBy] as number;
    return valueB - valueA;
  });

  return (
    <motion.div className="flex flex-col gap-4">
      {sortedPlayers.map((player, index) => (
        <motion.div
          key={player._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            passHref
            href={`/player/${player.nickname}`}
            className="block bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors"
          >
            <div className="flex gap-4 relative">
              <div
                className={`absolute -left-2 -top-2 flex items-center justify-center w-6 h-6 rounded-full ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-800 to-yellow-400"
                    : index === 1
                    ? "bg-gradient-to-r from-blue-800 to-blue-400"
                    : index === 2
                    ? "bg-gradient-to-r from-red-800 to-red-400"
                    : "bg-zinc-700"
                } text-zinc-200 font-bold`}
              >
                {index + 1}
              </div>
              <Image
                src={player.avatarUrl}
                alt={player.name}
                width={56}
                height={56}
                className="rounded-full object-cover object-center w-14 h-14"
              />
              <div className="flex-1 overflow-x-hidden">
                <h2 className="text-xl font-semibold text-ellipsis overflow-x-hidden whitespace-nowrap">
                  {getShortName(player.name)}
                </h2>
                <p className="text-zinc-400 text-sm">@{limitNickname(player.nickname, 18)}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{player[sortBy]}</p>
                <p className="text-sm text-zinc-400">
                  {sortBy === "pointsSolo"
                    ? "Pontos Solo"
                    : sortBy === "pointsTeam"
                    ? "Pontos Parceiradas"
                    : "Pontos Gerais"}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default withAuth(Ranking);
