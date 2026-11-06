"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/services/api";

// HOC
import withAuth from "@/hoc/withAuth";

// Contexts and Hooks
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import useStringUtils from "@/hooks/useStringUtils";
import { getApiErrorMessage } from "@/lib/api-error";

// Components
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameTypeSelector } from "@/components/CreateOrEditMatches/GameTypeSelector";
import { ContainerItem } from "@/components/CreateOrEditMatches/ContainerItem";
import { TeamSlots } from "@/components/CreateOrEditMatches/TeamSlots";
import { GameModeSelector } from "@/components/CreateOrEditMatches/GameModeSelector";
import SelectThePlayers from "@/components/CreateOrEditMatches/SelectThePlayers";

// Icons
import { PlusCircle } from "lucide-react";
import { FinalizerSelection } from "@/components/CreateOrEditMatches/FinalizerSelection";
import { PlayerSelection } from "@/components/CreateOrEditMatches/PlayerSelection";
import { MatchFormValues, SimplePlayer, GameMode, GameType } from "@/types/match";
import Header from "@/components/CreateOrEditMatches/Header";

const CreateMatch = () => {
  const queryClient = useQueryClient();
  const { getShortName } = useStringUtils();
  const { toast } = useToast();
  const router = useRouter();
  const { player: loggedInPlayer } = useAuth();
  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MatchFormValues>({
    defaultValues: {
      gametype: "",
      gamemode: "",
      teamA: [],
      teamB: [],
      finalizer: "",
    },
  });

  const [players, setPlayers] = useState<SimplePlayer[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{
    team: "teamA" | "teamB";
    position: number;
  } | null>(null);
  const [selectedPlayerPreview, setSelectedPlayerPreview] = useState<{
    teamA: (SimplePlayer | null)[];
    teamB: (SimplePlayer | null)[];
  }>({
    teamA: [null, null],
    teamB: [null, null],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(null);

  const teamA = watch("teamA");
  const teamB = watch("teamB");

  // função para selecionar o tipo de jogo - gametype
  const handleGameTypeSelect = (gametype: string) => {
    setSelectedGameType(gametype as GameType);
  };

  // função para selecionar o modo de jogo - gamemode
  const handleGameModeSelect = (gamemode: string) => {
    setSelectedGameMode(gamemode as GameMode);

    // Resetar estados quando o modo muda
    const slotsCount = gamemode === "parceirada" ? 2 : 1;
    setSelectedPlayerPreview({
      teamA: Array(slotsCount).fill(null),
      teamB: Array(slotsCount).fill(null),
    });
    setValue("teamA", Array(slotsCount).fill(""));
    setValue("teamB", Array(slotsCount).fill(""));
  };

  const handleSelectSlot = (team: "teamA" | "teamB", position: number) => {
    setSelectedSlot({ team, position });
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await api.get("/following");

        if (loggedInPlayer) {
          setPlayers([loggedInPlayer, ...response.data]);
        } else {
          return;
        }
      } catch (error) {
        console.error("Erro ao buscar jogadores:", error);
        toast({
          title: "Erro ao carregar jogadores",
          description: getApiErrorMessage(
            error,
            "Não foi possível carregar seus amigos."
          ),
          variant: "error",
        });
      }
    };

    fetchPlayers();
  }, [loggedInPlayer, toast]);

  const createMatchMutation = useMutation({
    mutationFn: async (data: MatchFormValues) => {
      const response = await api.post("/matches/create", {
        ...data,
        gametype: selectedGameType,
        gamemode: selectedGameMode,
        teamA: (data.teamA || []).filter(Boolean),
        teamB: (data.teamB || []).filter(Boolean),
      });
      return response.data;
    },
    onSuccess: (newMatch) => {
      const matchType = newMatch.gamemode === "cara_a_cara" ? "solo" : "team";

      // Invalida o cache para forçar uma nova requisição
      queryClient.invalidateQueries({
        queryKey: ["matches", matchType, loggedInPlayer?._id],
      });

      toast({
        title: "Partida criada com sucesso!",
        description: "A partida foi criada e está pronta para ser jogada.",
      });
      router.push("/home");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar partida",
        description: getApiErrorMessage(
          error,
          "Não foi possível criar a partida."
        ),
        variant: "error",
      });
    },
  });

  const onSubmit = async (data: MatchFormValues) => {
    if (selectedGameType === "bolinho" && selectedGameMode === "parceirada") {
      toast({
        title: "Erro ao criar partida",
        description: "Bolinho não pode ser jogado em parceirada",
        variant: "error",
      });
      return;
    }

    if (selectedGameMode === "parceirada") {
      const teamACount = data.teamA.filter(Boolean).length;
      const teamBCount = data.teamB.filter(Boolean).length;

      if (teamACount !== 2 || teamBCount !== 2) {
        toast({
          title: "Erro ao criar partida",
          description:
            "No modo parceirada, cada time deve ter exatamente 2 jogadores",
          variant: "error",
        });
        return;
      }
    }

    createMatchMutation.mutate(data);
  };

  const handleSelectPlayer = (playerId: string) => {
    if (!selectedSlot) return;

    const { team, position } = selectedSlot;
    const currentTeam = watch(team);
    const player = players.find((p) => p._id === playerId);

    if (!player) return;

    // Remove player from any position if already selected
    const removeFromTeam = (teamName: "teamA" | "teamB") => {
      const teamValues = [...watch(teamName)];
      const playerIndex = teamValues.indexOf(playerId);
      if (playerIndex >= 0) {
        teamValues.splice(playerIndex, 1);
        setValue(teamName, teamValues);

        // Atualizar preview
        setSelectedPlayerPreview((prev) => {
          const newTeamPreview = [...prev[teamName]];
          newTeamPreview[playerIndex] = null;
          return { ...prev, [teamName]: newTeamPreview };
        });
      }
    };

    removeFromTeam("teamA");
    removeFromTeam("teamB");

    // Adicionar jogador na nova posição
    const newTeamValues = [...currentTeam];
    newTeamValues[position] = playerId;
    setValue(team, newTeamValues);

    // Atualizar preview
    setSelectedPlayerPreview((prev) => {
      const newTeamPreview = [...prev[team]];
      newTeamPreview[position] = player;
      return { ...prev, [team]: newTeamPreview };
    });

    setSelectedSlot(null);
  };

  const handleRemovePlayer = (team: "teamA" | "teamB", position: number) => {
    // Remover do formulário
    const currentTeamValues = [...watch(team)];
    if (currentTeamValues[position]) {
      currentTeamValues[position] = "";
      setValue(team, currentTeamValues);
    }

    // Remover do preview
    setSelectedPlayerPreview((prev) => {
      const newTeamPreview = [...prev[team]];
      newTeamPreview[position] = null;
      return { ...prev, [team]: newTeamPreview };
    });
  };

  const isPlayerSelected = (playerId: string) => {
    return teamA.includes(playerId) || teamB.includes(playerId);
  };

  return (
    <>
      <Card className="container mx-auto w-full max-w-md p-2 border-0">
        <Header title="Criar Nova Partida" description="Selecione as regras para cirar uma nova partida." />
        <CardContent className="p-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <ContainerItem>
              <GameTypeSelector
                selectedGameType={selectedGameType}
                onSelect={handleGameTypeSelect}
              />
            </ContainerItem>

            <ContainerItem>
              <GameModeSelector
                selectedGameMode={selectedGameMode}
                selectedGameType={selectedGameType}
                onSelect={handleGameModeSelect}
              />
            </ContainerItem>

            <SelectThePlayers />

            <ContainerItem>
              <TeamSlots
                team="teamA"
                players={selectedPlayerPreview.teamA}
                selectedSlot={selectedSlot}
                onSelectSlot={handleSelectSlot}
                onRemovePlayer={handleRemovePlayer}
                slotsCount={selectedGameMode === "parceirada" ? 2 : 1}
              />

              <TeamSlots
                team="teamB"
                players={selectedPlayerPreview.teamB}
                selectedSlot={selectedSlot}
                onSelectSlot={handleSelectSlot}
                onRemovePlayer={handleRemovePlayer}
                slotsCount={selectedGameMode === "parceirada" ? 2 : 1}
              />
            </ContainerItem>

            {/* Player Selection Section */}
            {selectedGameMode && (
              <PlayerSelection
                players={players}
                onSelectPlayer={handleSelectPlayer}
                isPlayerSelected={isPlayerSelected}
              />
            )}

            {selectedGameMode && (
              <FinalizerSelection
                players={players}
                register={register}
                errors={errors}
                getShortName={getShortName}
              />
            )}

            <Button
              type="submit"
              className="w-full text-zinc-900 bg-green-500 disabled:bg-green-300"
              disabled={isLoading}
            >
              <PlusCircle size={48} />
              {isLoading ? "Criando..." : "Criar Partida"}{" "}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default withAuth(CreateMatch);
