"use client";

import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api, { editFinishedMatch } from "@/services/api";

// HOC
import withAuth from "@/hoc/withAuth";

// Contexts and Hooks
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import useStringUtils from "@/hooks/useStringUtils";

// Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Header from "@/components/CreateOrEditMatches/Header";
import Versus from "@/components/versus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContainerItem } from "@/components/CreateOrEditMatches/ContainerItem";
import { TeamSlots } from "@/components/CreateOrEditMatches/TeamSlots";
import { PlayerSelection } from "@/components/CreateOrEditMatches/PlayerSelection";
import SelectThePlayers from "@/components/CreateOrEditMatches/SelectThePlayers";
import { Label } from "@/components/ui/label";
import LinkBack from "@/components/linkBack";
import { SkeletonMatchLoading } from "../skeleton";

// Types
import {
  MatchFormValues,
  SimplePlayer,
  GameMode,
} from "@/types/match";

// Icons
import { Save, Trophy, AlertTriangle, Users } from "lucide-react";

const ConfirmationModal = dynamic(
  () => import("@/components/ConfirmationModal"),
  { ssr: false }
);

const EditFinishedMatchPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { getShortName, limitNickname } = useStringUtils();
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
  const [newWinner, setNewWinner] = useState<"teamA" | "teamB" | null>(null);
  const [activeTab, setActiveTab] = useState("winner");
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
      // Verificar se a partida está finalizada
      if (match.status !== "finished") {
        toast({
          title: "Operação não permitida",
          description: "Esta página é apenas para editar partidas finalizadas",
          variant: "error",
        });
        router.push(`/matches/${id}/edit`);
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

      // Definir o vencedor atual
      setNewWinner(match.winner);

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

  const handleSelectSlot = (team: "teamA" | "teamB", position: number) => {
    setSelectedSlot({ team, position });
  };

  const editFinishedMatchMutation = useMutation({
    mutationFn: async () => {
      if (!newWinner || !loggedInPlayer?._id) return null;

      const data: any = {
        finalizerId: loggedInPlayer._id,
        newWinner: newWinner,
      };

      // Se modificou os times, enviar os novos times
      if (activeTab === "players") {
        data.newTeamA = teamA.filter(Boolean);
        data.newTeamB = teamB.filter(Boolean);
      }

      return await editFinishedMatch(id as string, data);
    },
    onSuccess: () => {
      // Invalidar queries para forçar uma nova requisição
      queryClient.invalidateQueries({
        queryKey: ["match", id],
      });

      const matchType = match?.gamemode === "cara_a_cara" ? "solo" : "team";
      queryClient.invalidateQueries({
        queryKey: ["matches", matchType, loggedInPlayer?._id],
      });

      // Invalidar outras queries potencialmente afetadas
      queryClient.invalidateQueries({
        queryKey: ["player", loggedInPlayer?._id],
      });

      toast({
        title: "Partida atualizada com sucesso!",
        description:
          activeTab === "winner"
            ? "O vencedor da partida foi alterado."
            : "Os jogadores e o resultado da partida foram atualizados.",
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
    editFinishedMatchMutation.mutate();
    setIsConfirmationModalOpen(false);
  };

  const handleOpenConfirmationModal = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (activeTab === "winner" && !newWinner) {
      toast({
        title: "Erro ao atualizar partida",
        description: "Você precisa selecionar um vencedor",
        variant: "error",
      });
      return;
    }

    if (activeTab === "players") {
      // Validações para alteração de jogadores
      const data = watch();
      if (match?.gamemode === "parceirada") {
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
      } else {
        const teamACount = data.teamA.filter(Boolean).length;
        const teamBCount = data.teamB.filter(Boolean).length;

        if (teamACount !== 1 || teamBCount !== 1) {
          toast({
            title: "Erro ao atualizar partida",
            description:
              "No modo cara a cara, cada time deve ter exatamente 1 jogador",
            variant: "error",
          });
          return;
        }
      }
    }

    setIsConfirmationModalOpen(true);
  };

  const onSubmit = (data: MatchFormValues) => {
    editFinishedMatchMutation.mutate();
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

  if (!match) return null;

  return (
    <>
      <Card className="container mx-auto w-full max-w-md p-2 border-0">
        <LinkBack href={`/matches/${id}`} /> 
        <Header
          title="Editar Partida Finalizada"
          description="Modifique o resultado ou os jogadores da partida."
          icon={<Trophy size={24} />}
        />
        <CardContent className="p-2">
          <div className="flex flex-col items-start gap-2 bg-yellow-900/20 p-4 mb-4 rounded-md">
            <div className="flex gap-2">
              <AlertTriangle className="text-yellow-500" size={24} />
              <span className="text-yellow-500">ATENÇÃO</span>
            </div>
            <p className="text-yellow-100 text-sm">
              Alterar uma partida finalizada ajustará automaticamente as
              estatísticas e pontuações dos jogadores envolvidos.
            </p>
            <p className="text-yellow-200 text-sm">
              Obs: Se você errou os jogadores em partida e/ou quem venceu,
              corrija primeiro na aba dos jogadores quem jogou e depois o
              resultado.
            </p>
          </div>

          <Tabs
            defaultValue="winner"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 rounded-full gap-2">
              <TabsTrigger
                value="winner"
                className="flex gap-2 data-[state=active]:bg-green-700 data-[state=active]:text-zinc-200 font-bold rounded-full bg-zinc-700 text-zinc-500"
              >
                <Trophy size={16} /> Resultado
              </TabsTrigger>
              <TabsTrigger
                value="players"
                className="flex gap-2 data-[state=active]:bg-green-700 data-[state=active]:text-zinc-200 font-bold rounded-full bg-zinc-700 text-zinc-500"
              >
                <Users size={16} /> Jogadores
              </TabsTrigger>
            </TabsList>

            <TabsContent value="winner" className="pt-4">
              <form
                onSubmit={handleOpenConfirmationModal}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Selecione o vencedor</h3>

                  <RadioGroup
                    value={newWinner || undefined}
                    onValueChange={(value) =>
                      setNewWinner(value as "teamA" | "teamB")
                    }
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
                      {/* Time A */}
                      <div
                        className={`border-l-2 border-b-2 p-3 rounded-lg ${
                          newWinner === "teamA" ? "border-green-500" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem
                              value="teamA"
                              id="teamA"
                              className="text-green-500"
                            />
                            <Label
                              htmlFor="teamA"
                              className="text-sm font-medium cursor-pointer"
                              onClick={() => setNewWinner("teamA")}
                            >
                              {match.gamemode === "parceirada"
                                ? "Time A"
                                : "Jogador 1"}
                            </Label>
                          </div>
                        </div>

                        {match.teamA.map((player) => (
                          <div
                            key={player._id}
                            className="flex gap-2 mt-2"
                            onClick={() => {
                              setNewWinner("teamA");
                              document.getElementById("teamA")?.click();
                            }}
                          >
                            <Image
                              src={player.avatarUrl}
                              alt={player.name}
                              width={32}
                              height={32}
                              className="rounded-full w-8 h-8 object-cover object-center"
                            />
                            <span className="text-zinc-200 text-sm">
                              {limitNickname(player.nickname)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Versus />

                      {/* Time B */}
                      <div
                        className={`border-r-2 border-b-2 p-3 rounded-lg ${
                          newWinner === "teamB" ? "border-green-500" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Label
                            htmlFor="teamB"
                            className="text-sm font-medium cursor-pointer"
                            onClick={() => setNewWinner("teamB")}
                          >
                            {match.gamemode === "parceirada"
                              ? "Time B"
                              : "Jogador 2"}
                          </Label>
                          <RadioGroupItem
                            value="teamB"
                            id="teamB"
                            className="text-green-500"
                          />
                        </div>

                        {match.teamB.map((player) => (
                          <div
                            key={player._id}
                            className="flex flex-row-reverse gap-2 mt-2"
                            onClick={() => {
                              setNewWinner("teamB");
                              document.getElementById("teamB")?.click();
                            }}
                          >
                            <Image
                              src={player.avatarUrl}
                              alt={player.name}
                              width={32}
                              height={32}
                              className="rounded-full w-8 h-8 object-cover object-center"
                            />
                            <span className="text-zinc-200 text-sm">
                              {limitNickname(player.nickname)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  className="w-full text-zinc-900 bg-green-500 disabled:bg-green-300"
                  disabled={editFinishedMatchMutation.isPending || !newWinner}
                >
                  <Save size={24} className="mr-2" />
                  {editFinishedMatchMutation.isPending
                    ? "Salvando..."
                    : "Salvar Alterações"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="players" className="pt-4">
              <form
                onSubmit={handleOpenConfirmationModal}
                className="space-y-4"
              >
                <SelectThePlayers />

                <ContainerItem>
                  <TeamSlots
                    team="teamA"
                    players={selectedPlayerPreview.teamA}
                    selectedSlot={selectedSlot}
                    onSelectSlot={handleSelectSlot}
                    onRemovePlayer={handleRemovePlayer}
                    slotsCount={match.gamemode === "parceirada" ? 2 : 1}
                  />

                  <TeamSlots
                    team="teamB"
                    players={selectedPlayerPreview.teamB}
                    selectedSlot={selectedSlot}
                    onSelectSlot={handleSelectSlot}
                    onRemovePlayer={handleRemovePlayer}
                    slotsCount={match.gamemode === "parceirada" ? 2 : 1}
                  />
                </ContainerItem>

                {/* Player Selection Section */}
                <PlayerSelection
                  players={players}
                  onSelectPlayer={handleSelectPlayer}
                  isPlayerSelected={isPlayerSelected}
                />

                <Button
                  type="submit"
                  className="w-full text-zinc-900 bg-green-500 disabled:bg-green-300"
                  disabled={editFinishedMatchMutation.isPending}
                >
                  <Save size={24} className="mr-2" />
                  {editFinishedMatchMutation.isPending
                    ? "Salvando..."
                    : "Salvar Alterações"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Confirmar alterações"
        message={
          <>
            Tem certeza que deseja salvar as alterações?
            {activeTab === "winner" ? (
              <span>
                {" "}
                O novo vencedor será{" "}
                <span className="font-bold text-green-500">
                  {newWinner === "teamA"
                    ? match.teamA.map((player) => player.nickname).join(" e ")
                    : match.teamB.map((player) => player.nickname).join(" e ")}
                </span>
                .
              </span>
            ) : (
              " Isso alterará os jogadores da partida."
            )}
          </>
        }
      />
    </>
  );
};

export default withAuth(EditFinishedMatchPage);
