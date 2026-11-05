import { PlayerProfileData } from "@/types/profile";
import { SummarySkeleton } from "./skeleton";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fecthLastFiveMatchesByGamemode } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/lib/api-error";

// Icons
import {
  CircleUser,
  Users2,
  CirclePlay,
  Crown,
  ChevronsDown,
  CircleCheck,
  CircleX
} from "lucide-react";
import { RiGlobalLine } from "react-icons/ri";

interface LastMatchResult {
  isWinner: boolean;
}

interface PlayerStatsProps {
  data: PlayerProfileData;
  isLoading: boolean;
  gamemode?: "cara_a_cara" | "parceirada";
  generalStatics?: boolean;
}

const MatchResultIndicator = ({ isWinner }: LastMatchResult) => (
  <div>{isWinner ? <CircleCheck size={18} color={"oklch(0.723 0.219 149.579)"} /> : <CircleX color={"oklch(0.552 0.016 285.938)"} size={18} />  }</div>
);

export const PlayerStats = ({
  data,
  isLoading,
  gamemode,
  generalStatics,
}: PlayerStatsProps) => {
  const { player } = useAuth();

  const {
    data: lastMatches,
    isError: isLastMatchesError,
    error: lastMatchesError,
  } = useQuery({
    queryKey: ["lastMatches", gamemode, player?._id],
    queryFn: () => (gamemode ? fecthLastFiveMatchesByGamemode(gamemode) : null),
    enabled: !!gamemode && !!player?._id,
  });

  const getMatchResults = () => {
    if (!lastMatches?.matches) return Array(5).fill(false);

    return lastMatches.matches.map((match) => {
      const isPlayerInTeamA = match.playerTeam === "teamA";
      const didTeamAWin = match.winner === "teamA";

      return isPlayerInTeamA ? didTeamAWin : !didTeamAWin;
    });
  };

  if (isLoading) return <SummarySkeleton />;

  const stats = generalStatics
    ? {
        total: data?.totalMatchesSolo + data?.totalMatchesTeam,
        wins: data?.soloWins + data?.teamWins,
        losses: data?.soloLosses + data?.teamLosses,
        title: "Geral",
        points: data?.pointsSolo + data?.pointsTeam,
      }
    : gamemode === "cara_a_cara"
    ? {
        total: data?.totalMatchesSolo,
        wins: data?.soloWins,
        losses: data?.soloLosses,
        title: "Cara a Cara",
        points: data?.pointsSolo,
      }
    : {
        total: data?.totalMatchesTeam,
        wins: data?.teamWins,
        losses: data?.teamLosses,
        title: "Parceirada",
        points: data?.pointsTeam,
      };

  const winRate =
    stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4 bg-zinc-800 rounded-lg">
        <div className="flex justify-between items-start p-2 border-b-2 border-zinc-700">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {generalStatics ? (
                <RiGlobalLine size={28} className="text-green-500" />
              ) : gamemode === "cara_a_cara" ? (
                <CircleUser size={28} className="text-green-500" />
              ) : (
                <Users2 size={28} className="text-green-500" />
              )}
              <h3 className="text-xl font-semibold text-zinc-200">
                {stats.title}
              </h3>
            </div>

            {!generalStatics && gamemode && (
              <div className="flex gap-2 items-center">
                {isLastMatchesError ? (
                  <span className="text-xs text-red-500">
                    {getApiErrorMessage(
                      lastMatchesError,
                      "Não foi possível carregar os últimos resultados."
                    )}
                  </span>
                ) : (
                  getMatchResults().map((isWinner, index) => (
                    <MatchResultIndicator key={index} isWinner={isWinner} />
                  ))
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-green-500 bg-zinc-700 px-2 text-center rounded font-bold">
              {stats.points} - Pontos
            </span>
            <span
              className={`text-lg font-bold text-end ${
                Number(winRate) >= 50 ? "text-green-500" : "text-zinc-500"
              }`}
            >
              {winRate}%
            </span>
          </div>
        </div>

        <div className="px-2">
          <div className="flex items-center justify-between gap-1 p-2 bg-zinc-900 rounded">
            <div className="flex items-center gap-1">
              <CirclePlay size={14} />
              <span className="text-zinc-200">Partidas</span>
            </div>
            <span className="font-bold">{stats.total}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 px-2 pb-2 text-zinc-300">
          <div className="flex items-center justify-between p-2 bg-zinc-900 rounded">
            <div className="flex items-center gap-1">
              <Crown size={14} className="text-green-500" />
              <span className="text-green-500">Vitórias</span>
            </div>
            <span className="font-bold text-green-500">{stats.wins}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-zinc-900 rounded">
            <div className="flex items-center gap-1">
              <ChevronsDown size={14} className="text-zinc-400" />
              <span className="text-zinc-400">Derrotas</span>
            </div>
            <span className="font-bold text-zinc-400">{stats.losses}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
