"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "@/services/api";

// HOC
import withAuth from "@/hoc/withAuth";

// Contexts and Hooks
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import useStringUtils from "@/hooks/useStringUtils";

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
import { FinalizerSelection } from "@/components/CreateOrEditMatches/FinalizerSelection";
import { PlayerSelection } from "@/components/CreateOrEditMatches/PlayerSelection";
import Header from "@/components/CreateOrEditMatches/Header";
import LinkBack from "@/components/linkBack";
import { SkeletonMatchLoading } from "../skeleton";

// Types
import {
  MatchFormValues,
  SimplePlayer,
  GameMode,
  GameType,
} from "@/types/match";

// Icons
import { Save, Pencil } from "lucide-react";


const ConfirmationModal = dynamic(
  () => import("@/components/ConfirmationModal"),
  { ssr: false }
);

const EditMatchPage = () => {
  const { id } = useParams();
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
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(
    null
  );
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(
    null
  );
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const teamA = watch("teamA");
  const teamB = watch("teamB");

  // Buscar a partida
  const { data: match, isLoading: isMatchLoading } = useQuery({
    queryKey: ["match", id],
    queryFn: () => api.get(`/matches/${id}`).then((res) => res.data),
    refetchOnWindowFocus: false,
  });

  // Buscar jogadores
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await api.get("/following");

        if (loggedInPlayer) {
          setPlayers([loggedInPlayer, ...response.data]);
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

  // Carregar dados da partida quando disponíveis
  useEffect(() => {
    if (match && !isMatchLoading) {
      // Verificar se a partida pode ser editada
      if (match.status === "finished") {
        toast({
          title: "Operação não permitida",
          description: "Não é possível editar uma partida finalizada",
          variant: "error",
        });
        router.push(`/matches/${id}`);
        return;
      }

      // Verificar se o usuário logado é o finalizador da partida
      if (loggedInPlayer && match.finalizer._id !== loggedInPlayer._id) {
        toast({
          title: "Acesso negado",
          description: "Apenas o finalizador pode editar esta partida",
          variant: "error",
        });
        router.push(`/matches/${id}`);
        return;
      }

      // Preencher o formulário com os dados da partida
      setValue("gametype", match.gametype);
      setValue("gamemode", match.gamemode);
      setValue(
        "teamA",
        match.teamA.map((p) => p._id)
      );
      setValue(
        "teamB",
        match.teamB.map((p) => p._id)
      );
      setValue("finalizer", match.finalizer._id);

      // Atualizar os estados
      setSelectedGameType(match.gametype as GameType);
      setSelectedGameMode(match.gamemode as GameMode);

      // Preparar o preview dos jogadores
      const teamAPreview = Array(match.gamemode === "parceirada" ? 2 : 1).fill(
        null
      );
      const teamBPreview = Array(match.gamemode === "parceirada" ? 2 : 1).fill(
        null
      );

      match.teamA.forEach((player, index) => {
        teamAPreview[index] = player;
      });

      match.teamB.forEach((player, index) => {
        teamBPreview[index] = player;
      });

      setSelectedPlayerPreview({
        teamA: teamAPreview,
        teamB: teamBPreview,
      });
    }
  }, [match, isMatchLoading, setValue, loggedInPlayer, router, id, toast]);

  // função para selecionar o tipo de jogo - gametype
  const handleGameTypeSelect = (gametype: string) => {
    setSelectedGameType(gametype as GameType);
    setValue("gametype", gametype);
  };

  // função para selecionar o modo de jogo - gamemode
  const handleGameModeSelect = (gamemode: string) => {
    setSelectedGameMode(gamemode as GameMode);
    setValue("gamemode", gamemode);

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

  const editMatchMutation = useMutation({
    mutationFn: async (data: MatchFormValues) => {
      const response = await api.put(`/matches/edit/${id}`, {
        ...data,
        gametype: selectedGameType,
        gamemode: selectedGameMode,
        finalizerId: loggedInPlayer?._id,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidar queries para forçar uma nova requisição
      queryClient.invalidateQueries({
        queryKey: ["match", id],
      });

      const matchType = selectedGameMode === "cara_a_cara" ? "solo" : "team";
      queryClient.invalidateQueries({
        queryKey: ["matches", matchType, loggedInPlayer?._id],
      });

      toast({
        title: "Partida atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
      router.push(`/matches/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar partida",
        description: getApiErrorMessage(
          error,
          "Ocorreu um erro ao atualizar a partida."
        ),
        variant: "error",
      });
    },
  });

  const handleConfirmSave = () => {
    editMatchMutation.mutate(watch());
    setIsConfirmationModalOpen(false);
  };

  const validateAndOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = watch();
    
    // Validações
    if (selectedGameType === "bolinho" && selectedGameMode === "parceirada") {
      toast({
        title: "Erro ao atualizar partida",
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
          title: "Erro ao atualizar partida",
          description:
            "No modo parceirada, cada time deve ter exatamente 2 jogadores",
          variant: "error",
        });
        return;
      }
    }

    setIsConfirmationModalOpen(true);
  };

  const onSubmit = async (data: MatchFormValues) => {
    // A validação agora está em validateAndOpenModal
    editMatchMutation.mutate(data);
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

  if (isMatchLoading) {
    return <SkeletonMatchLoading />;
  }

  return (
    <>
      <Card className="container mx-auto w-full max-w-md p-2 border-0">
        <LinkBack href={`/matches/${id}`} /> 
        <Header
          title="Editar Partida"
          description="Modifique os detalhes da partida existente."
          icon={<Pencil size={24} />}
        />
        <CardContent className="p-2">
          <form onSubmit={validateAndOpenModal} className="space-y-4">
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
                defaultValue={match?.finalizer._id}
              />
            )}

            <Button
              type="submit"
              className="w-full text-zinc-900 bg-green-500 disabled:bg-green-300"
              disabled={isLoading || editMatchMutation.isPending}
            >
              <Save size={24} className="mr-2" />
              {editMatchMutation.isPending
                ? "Salvando..."
                : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Adicione o modal */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Confirmar alterações"
        message="Tem certeza que deseja salvar as alterações na partida?"
      />
    </>
  );
};

export default withAuth(EditMatchPage);
