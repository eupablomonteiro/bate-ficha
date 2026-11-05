"use client";

import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

// Utils
import { formatDuration } from "@/utils/formatDuration";

// Contexts and Hooks
import useStringUtils from "@/hooks/useStringUtils";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/lib/api-error";

// Animations
import { motion } from "framer-motion";

// Components
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import Versus from "../versus";

// Icons
import {
  GalleryHorizontalEnd,
  ChevronLeftCircle,
  ChevronRightCircle,
} from "lucide-react";

// Types
import { Player } from "@/types/auth";
import {
  SkeletonHistoryMatchesSolo,
  SkeletonHistoryMatchesTeam,
} from "./skeleton";

interface Match {
  _id: string;
  gamemode: string;
  gametype: string;
  status: string;
  teamA: Player[];
  teamB: Player[];
  players: Player[];
  winner: string;
  createdAt: string;
  updatedAt: string;
}

interface MatchesResponse {
  matches: Match[];
  pagination: {
    currentPage: number;
    limit: number;
    totalMatches: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const fetchMatches = async (endpoint: string) => {
  const response = await api.get(endpoint);
  return response.data;
};

const HistoryMatches = () => {
  const { limitNickname } = useStringUtils();
  const { player } = useAuth();
  const router = useRouter();
  const VersusMemo = React.memo(Versus);
  const [soloPage, setSoloPage] = useState(1);
  const [teamPage, setTeamPage] = useState(1);

  // Query para partidas solo
  const {
    data: soloMatches,
    isLoading: isLoadingSolo,
    isFetching: isFetchingSolo,
    isError: isErrorSolo,
    error: errorSolo,
  } = useQuery<MatchesResponse>({
    queryKey: ["matches", "solo", player?._id, soloPage],
    queryFn: () => fetchMatches(`/matches/solo?page=${soloPage}&limit=5`),
    staleTime: 1000 * 60 * 15,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: true,
    enabled: !!player?._id,
  });

  // Query para partidas em time
  const {
    data: teamMatches,
    isLoading: isLoadingTeam,
    isFetching: isFetchingTeam,
    isError: isErrorTeam,
    error: errorTeam,
  } = useQuery<MatchesResponse>({
    queryKey: ["matches", "team", player?._id, teamPage],
    queryFn: () => fetchMatches(`/matches/team?page=${teamPage}&limit=5`),
    staleTime: 1000 * 60 * 15,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: true,
    enabled: !!player?._id,
  });

  const handlePageChange = (type: "solo" | "team", page: number) => {
    if (type === "solo") {
      setSoloPage(page);
    } else {
      setTeamPage(page);
    }
  };

  const renderPagination = (type: "solo" | "team", pagination: any) => {
    const currentPage = type === "solo" ? soloPage : teamPage;
    const totalPages = pagination.totalPages;
    const isFetching = type === "solo" ? isFetchingSolo : isFetchingTeam;

    return (
      <Pagination className="flex">
        <PaginationContent className="flex w-full justify-between">
          <PaginationItem>
            <Button
              className={`${
                currentPage === 1 || isFetching
                  ? "bg-zinc-800 cursor-not-allowed text-zinc-500"
                  : "bg-green-700 cursor-pointer text-zinc-200"
              } rounded select-none`}
              disabled={currentPage === 1 || isFetching}
              onClick={() => handlePageChange(type, currentPage - 1)}
            >
              <ChevronLeftCircle size={18} />
              Anterior
            </Button>
          </PaginationItem>

          <PaginationItem>
            <Button
              className={`${
                currentPage === totalPages || isFetching
                  ? "bg-zinc-800 cursor-not-allowed text-zinc-500"
                  : "bg-green-700 cursor-pointer text-zinc-200"
              } rounded select-none`}
              disabled={currentPage === totalPages || isFetching}
              onClick={() => handlePageChange(type, currentPage + 1)}
            >
              Próximo
              <ChevronRightCircle size={18} />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderMatch = (match: Match) => {
    const isTeamAWinner = match?.winner === "teamA";
    const isTeamBWinner = match?.winner === "teamB";
    const isNotWinner = match?.winner === "none";
    const duration = formatDuration(match.createdAt, match.updatedAt);

    // Verifica se os dados dos jogadores estão presentes
    if (
      !match.teamA ||
      !match.teamB ||
      !match.teamA.length ||
      !match.teamB.length
    ) {
      return null; // ou exibir um skeleton/loading
    }

    return (
      <motion.div
        key={match?._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`flex flex-col flex-wrap min-w-full h-full rounded-md ${
          isTeamAWinner
            ? "bg-gradient-to-br from-green-500/50 via-zinc-500/0 to-transparent"
            : isTeamBWinner
            ? "bg-gradient-to-tl from-green-500/50 via-zinc-500/0 to-transparent"
            : isNotWinner && "bg-zinc-900"
        }`}
        onClick={() => router.push(`/matches/${match._id}`)}
      >
        <div className="relative text-md flex items-center justify-between py-2 px-2 border-b-2 border-zinc-950">
          <span className="text-zinc-200">
            {match?.gametype === "par_ou_impar" ? "Par ou Ímpar" : "Bolinho"}
          </span>
          {match.status === "finished" && (
            <span className="absolute top-3 left-0 right-0 flex items-center justify-center text-zinc-200 text-xs">{duration}</span>
          )}
          <div
            className={`flex items-center justify-center gap-2 ${
              match?.status === "finished" ? "text-zinc-700" : "text-green-700"
            } h-0 p-0`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                match?.status === "finished"
                  ? "bg-zinc-700"
                  : "bg-transparent border-2 border-green-700"
              }`}
            ></span>
            {match?.status === "finished" ? "Finalizada" : "Em andamento"}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 p-2 text-zinc-200">
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-start">
              <span className="text-sm text-left">
                {match?.teamA.map((player) => (
                  <p key={player._id}>{limitNickname(player.nickname, 18)}</p>
                ))}
              </span>
            </div>
            {match?.status === "finished" && (
              <div
                className={`rounded-md w-full text-center ${
                  isTeamAWinner
                    ? "bg-green-700 text-zinc-200"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {isTeamAWinner ? "Vitória" : "Derrota"} 
              </div>
            )}
          </div>

          <VersusMemo />

          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-end">
              <span className="text-sm text-right">
                {match?.teamB.map((player) => (
                  <p key={player._id}>{limitNickname(player.nickname, 18)}</p>
                ))}
              </span>
            </div>
            {match?.status === "finished" && (
              <div
                className={`rounded-md w-full text-center ${
                  isTeamBWinner
                    ? "bg-green-700 text-zinc-200"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {isTeamBWinner ? "Vitória" : "Derrota"}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto flex flex-col">
      <h1 className="text-2xl font-bold flex items-center gap-2 p-2 text-zinc-200">
        <GalleryHorizontalEnd size={24} /> Histórico de{" "}
        <span className="text-green-700">Partidas</span>
      </h1>

      <Tabs defaultValue="solo" className="w-full p-2">
        <TabsList className="grid w-full grid-cols-2 gap-2 bg-zinc-900 rounded-full">
          <TabsTrigger
            value="solo"
            className="data-[state=active]:bg-green-700 data-[state=active]:text-zinc-200 rounded-full bg-zinc-800 text-zinc-500"
          >
            Cara a Cara
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-green-700 data-[state=active]:text-zinc-200 rounded-full bg-zinc-800 text-zinc-500"
          >
            Parceiradas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solo">
          <div className="flex flex-col gap-4">
            {isLoadingSolo || isFetchingSolo ? (
              <>
                <SkeletonHistoryMatchesSolo />
                <SkeletonHistoryMatchesSolo />
                <SkeletonHistoryMatchesSolo />
                <SkeletonHistoryMatchesSolo />
                <SkeletonHistoryMatchesSolo />
              </>
            ) : isErrorSolo ? (
              <p className="text-red-500">
                {getApiErrorMessage(errorSolo, "Erro ao carregar partidas.")}
              </p>
            ) : soloMatches?.matches?.length ? (
              <>
                {soloMatches.matches.map(renderMatch)}
                {renderPagination("solo", soloMatches.pagination)}
              </>
            ) : (
              <p className="text-zinc-500">Nenhuma partida encontrada</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="team">
          <div className="flex flex-col gap-2">
            {isLoadingTeam || isFetchingTeam ? (
              <>
                <SkeletonHistoryMatchesTeam />
                <SkeletonHistoryMatchesTeam />
                <SkeletonHistoryMatchesTeam />
                <SkeletonHistoryMatchesTeam />
                <SkeletonHistoryMatchesTeam />
              </>
            ) : isErrorTeam ? (
              <p className="text-red-500">
                {getApiErrorMessage(errorTeam, "Erro ao carregar partidas.")}
              </p>
            ) : teamMatches?.matches?.length ? (
              <>
                {teamMatches.matches.map(renderMatch)}
                {renderPagination("team", teamMatches.pagination)}
              </>
            ) : (
              <p className="text-zinc-500">Nenhuma partida encontrada</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HistoryMatches;
