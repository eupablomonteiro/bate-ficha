"use client";

import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import withAuth from "@/hoc/withAuth";
import api from "@/services/api";
import Image from "next/image";

// Context and Hooks
import useStringUtils from "@/hooks/useStringUtils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Icons
import { Search, Handshake, UserPlus, Filter, Users } from "lucide-react";
import SkeletonAddFriends from "./skeleton";

// Utils
import { getApiErrorMessage } from "@/lib/api-error";
import {
  filterPlayers,
  setFollowingState,
  FollowablePlayer,
  PlayerFilter,
} from "@/lib/players";

// Interfaces
interface Player extends FollowablePlayer {
  name: string;
  nickname: string;
  avatarUrl: string;
}

interface FollowMutationContext {
  previousAllPlayers?: Player[];
  previousSearchResults: [QueryKey, Player[] | undefined][];
}

const AddFriendsPage = () => {
  const { getShortName, limitNickname } = useStringUtils();
  const queryClient = useQueryClient();
  const { player: loggedInPlayer } = useAuth();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [filter, setFilter] = useState<PlayerFilter>("all");
  const [unfollowPlayerId, setUnfollowPlayerId] = useState<string | null>(null);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);

  // Buscar todos os jogadores (com status de follow)
  const {
    data: allPlayers = [],
    isLoading: isLoadingAll,
    isError: isErrorAll,
    error: allPlayersError,
    refetch: refetchAllPlayers,
  } = useQuery<Player[]>({
    queryKey: ["allPlayers"],
    queryFn: async () => {
      const response = await api.get("/player/get-all");
      return response.data;
    },
  });

  // Buscar jogadores por busca (query)
  const {
    data: searchResults = [],
    isLoading: isLoadingSearch,
    isError: isErrorSearch,
    error: searchPlayersError,
    refetch: refetchSearchPlayers,
  } = useQuery<Player[]>({
    queryKey: ["searchPlayers", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return [];
      const response = await api.get("/player/search", {
        params: { query: debouncedQuery },
      });
      return response.data;
    },
    enabled: debouncedQuery.length >= 2,
  });

  // Determina quais players mostrar baseado no filtro e busca
  const playersToShow = useMemo(
    () =>
      filterPlayers(
        debouncedQuery.length >= 2 ? searchResults : allPlayers,
        filter,
        loggedInPlayer?._id
      ),
    [
      filter,
      loggedInPlayer?._id,
      allPlayers,
      searchResults,
      debouncedQuery.length,
    ]
  );

  const updateFollowingInCaches = (playerId: string, isFollowing: boolean) => {
    queryClient.setQueryData<Player[]>(["allPlayers"], (oldPlayers) =>
      setFollowingState(oldPlayers, playerId, isFollowing)
    );

    queryClient.setQueriesData<Player[]>(
      { queryKey: ["searchPlayers"] },
      (oldPlayers) => setFollowingState(oldPlayers, playerId, isFollowing)
    );
  };

  const restoreCaches = (context?: FollowMutationContext) => {
    if (context?.previousAllPlayers) {
      queryClient.setQueryData(["allPlayers"], context.previousAllPlayers);
    }

    context?.previousSearchResults?.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  };

  // Mutação para seguir jogador
  const followMutation = useMutation({
    mutationFn: async (playerId: string) => {
      if (playerId === loggedInPlayer?._id) {
        throw new Error("Você não pode seguir a si mesmo.");
      }

      const response = await api.post(`/follow/${playerId}`);
      return response.data as { message?: string };
    },
    onMutate: async (playerId) => {
      await queryClient.cancelQueries({ queryKey: ["allPlayers"] });
      await queryClient.cancelQueries({ queryKey: ["searchPlayers"] });

      const previousAllPlayers = queryClient.getQueryData<Player[]>([
        "allPlayers",
      ]);
      const previousSearchResults = queryClient.getQueriesData<Player[]>({
        queryKey: ["searchPlayers"],
      });

      updateFollowingInCaches(playerId, true);

      return { previousAllPlayers, previousSearchResults };
    },
    onError: (error, _playerId, context) => {
      restoreCaches(context);

      toast({
        title: "Não foi possível seguir",
        description: getApiErrorMessage(
          error,
          "Não foi possível seguir este jogador."
        ),
        variant: "error",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso",
        description:
          data?.message || "Agora você está seguindo este jogador.",
        variant: "success",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allPlayers"] });
      queryClient.invalidateQueries({ queryKey: ["searchPlayers"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const response = await api.post(`/unfollow/${playerId}`);
      return response.data as { message?: string };
    },
    onMutate: async (playerId) => {
      await queryClient.cancelQueries({ queryKey: ["allPlayers"] });
      await queryClient.cancelQueries({ queryKey: ["searchPlayers"] });

      const previousAllPlayers = queryClient.getQueryData<Player[]>([
        "allPlayers",
      ]);
      const previousSearchResults = queryClient.getQueriesData<Player[]>({
        queryKey: ["searchPlayers"],
      });

      updateFollowingInCaches(playerId, false);

      return { previousAllPlayers, previousSearchResults };
    },
    onError: (error, _playerId, context) => {
      restoreCaches(context);

      toast({
        title: "Não foi possível deixar de seguir",
        description: getApiErrorMessage(
          error,
          "Não foi possível deixar de seguir este jogador."
        ),
        variant: "error",
      });
    },
    onSuccess: (data) => {
      setUnfollowPlayerId(null);
      setShowUnfollowModal(false);

      toast({
        title: "Sucesso",
        description:
          data?.message || "Você deixou de seguir este jogador.",
        variant: "success",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["allPlayers"] });
      queryClient.invalidateQueries({ queryKey: ["searchPlayers"] });
    },
  });

  const handleConfirmUnfollow = () => {
    if (!unfollowPlayerId) return;
    unfollowMutation.mutate(unfollowPlayerId);
  };

  const isFollowingPlayer = (playerId: string) =>
    followMutation.isPending && followMutation.variables === playerId;

  const isUnfollowingPlayer = (playerId: string) =>
    unfollowMutation.isPending && unfollowMutation.variables === playerId;

  const isInitialLoading =
    isLoadingAll || (debouncedQuery.length >= 2 && isLoadingSearch);

  const listError = isErrorAll
    ? allPlayersError
    : isErrorSearch
    ? searchPlayersError
    : null;

  const handleRetry = () => {
    if (isErrorAll) refetchAllPlayers();
    if (isErrorSearch && debouncedQuery.length >= 2) refetchSearchPlayers();
  };

  // Contadores para badges
  const totalFollowing = allPlayers.filter((p) => p.isFollowing).length;
  const totalNotFollowing = allPlayers.filter(
    (p) => !p.isFollowing && p._id !== loggedInPlayer?._id
  ).length;

  return (
    <>
      <div className="flex flex-col gap-4 items-center h-screen mt-4">
        <h1 className="text-xl font-bold flex gap-4 items-center justify-center">
          <Handshake size={24} /> Adicionar Amigos
        </h1>

        <div className="flex flex-col gap-4 w-full max-w-2xl p-2">
          {/* Busca */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Digite o nome ou apelido do amigo"
              value={query}
              className="bg-zinc-800 pr-10 text-zinc-200 placeholder:text-zinc-500 border-0"
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-200 font-bold absolute right-0 top-0"
              disabled={isLoadingSearch}
            >
              <Search size={18} />
            </Button>
            {query.length === 1 && (
              <p className="text-sm text-yellow-500 mt-1">
                Digite pelo menos 2 caracteres
              </p>
            )}
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-zinc-200"
            >
              <Users size={14} /> Todos
            </Button>
            <Button
              variant={filter === "following" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("following")}
              className="text-zinc-200"
            >
              <Filter size={14} /> Seguindo{" "}
              <span className="px-1">{totalFollowing}</span>
            </Button>
            <Button
              variant={filter === "not-following" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("not-following")}
              className="text-zinc-200"
            >
              <UserPlus size={14} /> Não seguidos{" "}
              <span className="px-1">{totalNotFollowing}</span>
            </Button>
          </div>
          {/* Lista de jogadores */}
          <div className="flex flex-col gap-2">
            {isInitialLoading ? (
              <>
                <SkeletonAddFriends />
                <SkeletonAddFriends />
                <SkeletonAddFriends />
              </>
            ) : listError ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <p className="text-red-500">
                  {getApiErrorMessage(listError, "Erro ao carregar jogadores.")}
                </p>
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  className="text-zinc-200"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : playersToShow.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users size={48} className="mx-auto text-zinc-600 mb-4" />
                <h2 className="text-lg font-semibold text-zinc-200 mb-2">
                  {debouncedQuery.length >= 2
                    ? "Nenhum jogador encontrado."
                    : "Não há jogadores para exibir."}
                </h2>
                <p className="text-zinc-400 text-sm max-w-xs">
                  {filter === "not-following"
                    ? "Você já segue todos os jogadores disponíveis. 🎉"
                    : filter === "following"
                    ? "Você ainda não segue ninguém. Comece seguindo alguém para aparecer aqui."
                    : "Cadastre jogadores para começar a seguir."}
                </p>
                {debouncedQuery.length >= 2 && (
                  <Button
                    variant="outline"
                    onClick={() => setQuery("")}
                    className="mt-4 text-zinc-200"
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
            ) : (
              playersToShow.map((player) => (
                <div
                  key={player._id}
                  className="flex justify-between items-center p-4 bg-zinc-800 rounded-md border border-zinc-700"
                >
                  <div className="flex gap-2 items-center">
                    <Image
                      src={player.avatarUrl}
                      alt={player.name}
                      width={48}
                      height={48}
                      className="rounded-full w-12 h-12 object-cover object-center"
                    />
                    <div className="flex flex-col">
                      <p className="font-bold text-zinc-200">
                        {getShortName(player.name)}
                      </p>
                      <p className="text-sm text-zinc-400">
                        @{limitNickname(player.nickname, 20)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {player._id === loggedInPlayer?._id ? (
                      <Button variant="ghost" size="sm" disabled>
                        Você
                      </Button>
                    ) : player.isFollowing ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-zinc-200 text-zinc-800"
                        onClick={() => {
                          setUnfollowPlayerId(player._id);
                          setShowUnfollowModal(true);
                        }}
                        disabled={
                          isFollowingPlayer(player._id) ||
                          isUnfollowingPlayer(player._id)
                        }
                      >
                        {isFollowingPlayer(player._id) ||
                        isUnfollowingPlayer(player._id)
                          ? "Processando..."
                          : "Seguindo"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 text-zinc-200"
                        onClick={() => followMutation.mutate(player._id)}
                        disabled={isFollowingPlayer(player._id)}
                      >
                        {isFollowingPlayer(player._id)
                          ? "Seguindo..."
                          : "Seguir"}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal de confirmação */}
        {showUnfollowModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 p-6 rounded-md max-w-md w-full">
              <h2 className="text-xl font-bold text-zinc-200 mb-4">
                Deixar de seguir
              </h2>
              <p className="text-zinc-400 mb-6">
                Tem certeza que deseja deixar de seguir este jogador?
              </p>
              <div className="flex justify-end gap-4">
                <Button
                  variant="default"
                  onClick={() => {
                    setShowUnfollowModal(false);
                    setUnfollowPlayerId(null);
                  }}
                  className="bg-zinc-200 text-zinc-900"
                >
                  Cancelar
                </Button>
                <Button
                  variant="default"
                  onClick={handleConfirmUnfollow}
                  className="bg-red-500 text-zinc-900 font-bold disabled:opacity-50"
                  disabled={unfollowMutation.isPending}
                >
                  {unfollowMutation.isPending
                    ? "Processando..."
                    : "Deixar de Seguir"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuth(AddFriendsPage);
