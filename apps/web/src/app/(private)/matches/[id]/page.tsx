"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import withAuth from "@/hoc/withAuth";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Contexts and Hooks
import useStringUtils from "@/hooks/useStringUtils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";

// Layout
import PrivateLayout from "@/layouts/PrivateLayout";

// Components
import { Button } from "@/components/ui/button";
import Versus from "@/components/versus";
import { SkeletonMatchLoading } from "./skeleton";
import Link from "next/link";
import { ArrowLeft, PencilIcon } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";
import LinkBack from "@/components/linkBack";

interface Match {
  _id: string;
  players: string[];
  gametype: string;
  gamemode: string;
  teamA: { _id: string; name: string; nickname: string; avatarUrl: string }[];
  teamB: { _id: string; name: string; nickname: string; avatarUrl: string }[];
  finalizer: { _id: string; name: string; nickname: string; avatarUrl: string };
  status: string;
  winner: string;
  createdAt: string;
  updatedAt: string;
}

const fetchMatch = async (id: string) => {
  const response = await api.get(`/matches/${id}`);
  return response.data;
};

const MatchPage = () => {
  const { limitNickname, getShortName } = useStringUtils();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { player: loggedInPlayer } = useAuth();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<"teamA" | "teamB" | null>(
    null
  );

  const {
    data: match,
    isLoading: isMatchLoading,
    isError: isMatchError,
    error: matchError,
  } = useQuery<Match>({
    queryKey: ["match", id],
    queryFn: () => fetchMatch(id as string),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const finishMatchMutation = useMutation({
    mutationFn: async ({
      winner,
      finalizer,
    }: {
      winner: "teamA" | "teamB";
      finalizer: string;
    }) => {
      const response = await api.post(`/matches/${id}/finish`, {
        winner,
        finalizer,
      });
      return response.data;
    },
    onSuccess: async (data) => {
      const matchType = data.gamemode === "cara_a_cara" ? "solo" : "team";

      queryClient.invalidateQueries({
        queryKey: ["match", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["matches", matchType, loggedInPlayer?._id],
      });

      toast({
        title: "Partida finalizada com sucesso!",
        description: "A partida foi finalizada e o resultado foi registrado.",
      });

      router.push("/home");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao finalizar partida",
        description: getApiErrorMessage(
          error,
          "Erro ao finalizar partida."
        ),
        variant: "error",
      });
    },
  });

  const handleTeamClick = (team: "teamA" | "teamB") => {
    if (match?.status === "running") {
      setSelectedTeam(team);
      setIsConfirmationModalOpen(true);
    }
  };

  const handleConfirm = () => {
    if (selectedTeam) {
      handleFinishMatch(selectedTeam);
      setIsConfirmationModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsConfirmationModalOpen(false);
    setSelectedTeam(null);
  };

  const handleFinishMatch = async (winner: "teamA" | "teamB") => {
    if (!loggedInPlayer?._id) return;
    finishMatchMutation.mutate({
      winner,
      finalizer: loggedInPlayer._id,
    });
  };

  if (isMatchLoading) {
    return (
      <PrivateLayout>
        <SkeletonMatchLoading />
      </PrivateLayout>
    );
  }

  // Se houver erro
  if (isMatchError || !match) {
    router.push("/home");
    toast({
      title: "Erro",
      description: getApiErrorMessage(
        matchError,
        "Não foi possível carregar os detalhes da partida."
      ),
      variant: "error",
    });
    return null;
  }

  return (
    <PrivateLayout>
      <div className="container flex flex-col gap-2 mx-auto p-2">
        <div className="flex justify-between">
          <LinkBack href={`/home`} text="Voltar" />
          {loggedInPlayer._id === match.finalizer._id && (
            <Link
              href={`/matches/${id}/${
                match.status === "finished" ? "edit-finished" : "edit"
              }`}
              className="px-4 flex gap-2 items-center justify-end bg-zinc-200 text-zinc-900 hover:bg-zinc-300 rounded-full"
              passHref
            >
              <PencilIcon size={16} />
              Editar Partida
            </Link>
          )}
        </div>
        <div className="flex flex-col gap-2 p-2 bg-zinc-900 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Detalhes da Partida</h1>
            <div
              className={`flex justify-end items-center gap-2 ${
                match.status === "running" ? "text-green-700" : "text-zinc-500"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  match.status === "running"
                    ? "border-2 border-green-700"
                    : "bg-zinc-500"
                }`}
              ></span>
              {match.status === "running" ? "Em Andamento" : "Finalizada"}
            </div>
          </div>

          <div className={`flex gap-2 text-zinc-400`}>
            <div className="flex justify-start items-center">
              {match.gametype === "bolinho" ? "Bolinho" : "Par ou Ímpar"}
            </div>
            <span className="">|</span>
            <div className="flex justify-center items-center">
              {match.gamemode === "cara_a_cara" ? "Cara a Cara" : "Parceirada"}
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-zinc-950 p-2 rounded-lg border-b-2 border-green-700">
            <h4 className="text-md font-semibold text-zinc-200">
              Finalizador Responsável
            </h4>
            <div className="flex items-start gap-2">
              <Image
                src={match.finalizer.avatarUrl}
                alt={match.finalizer.name}
                width={64}
                height={64}
                className="rounded-full w-16 h-16 object-cover object-center"
              />
              <div className="flex flex-col gap-0 space-y-0 line-height-none">
                <span className="text-md font-semibold text-zinc-200">
                  {getShortName(match.finalizer.name)}
                </span>
                <span className="text-sm text-zinc-400">
                  @{limitNickname(match.finalizer.nickname)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-2 bg-zinc-900 rounded-lg shadow-md">
          <div className="flex flex-col gap-4">
            <h5 className="text-lg text-zinc-200 flex flex-col">
              Jogadores
              <span className="text-sm text-zinc-400">
                {match.winner !== "none"
                  ? "O vencedor já foi decidido."
                  : "Aperte em um dos times decidir o vencedor."}
              </span>
            </h5>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
              <div
                className={`flex flex-col gap-2 bg-zinc-950 p-2 rounded-lg cursor-pointer hover:bg-zinc-700 ${
                  match.winner === "teamA"
                    ? "border-l-2 border-b-2 border-green-700"
                    : "border-l-2 border-b-2 border-zinc-500"
                }`}
                onClick={() => handleTeamClick("teamA")}
              >
                {match.teamA.map((player) => (
                  <div key={player._id} className="flex gap-2">
                    <Image
                      src={player?.avatarUrl}
                      alt={player.name}
                      width={32}
                      height={32}
                      className="rounded-full w-8 h-8 object-cover object-center"
                    />
                    <span className="text-zinc-200 text-sm">
                      {limitNickname(player.nickname, 10)}
                    </span>
                  </div>
                ))}
              </div>

              <Versus />

              <div
                className={`flex flex-col gap-2 bg-zinc-950 p-2 rounded-lg cursor-pointer hover:bg-zinc-700 ${
                  match.winner === "teamB"
                    ? "border-r-2 border-b-2 border-green-700"
                    : "border-r-2 border-b-2 border-zinc-500"
                }`}
                onClick={() => handleTeamClick("teamB")}
              >
                {match.teamB.map((player) => (
                  <div key={player._id} className="flex flex-row-reverse gap-2">
                    <Image
                      src={player?.avatarUrl}
                      alt={player.name}
                      width={32}
                      height={32}
                      className="rounded-full w-8 h-8 object-cover object-center"
                    />
                    <span className="text-zinc-200 text-sm">
                      {limitNickname(player.nickname, 10)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ConfirmationModal
            isOpen={isConfirmationModalOpen}
            onClose={handleCancel}
            onConfirm={handleConfirm}
            title="Confirmar vencedor"
            message={
              <>
                Você tem certeza que vai nomear{" "}
                <span
                  className={`${
                    selectedTeam === "teamA"
                      ? "text-green-700"
                      : "text-blue-500"
                  }`}
                >
                  {selectedTeam === "teamA"
                    ? match.teamA.map((player) => player.nickname).join(" e ")
                    : match.teamB.map((player) => player.nickname).join(" e ")}
                </span>{" "}
                como vencedor?
              </>
            }
          />
        </div>
      </div>
    </PrivateLayout>
  );
};

export default withAuth(MatchPage);
