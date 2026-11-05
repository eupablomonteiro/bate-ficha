export interface FollowablePlayer {
  _id: string;
  isFollowing: boolean;
}

export type PlayerFilter = "all" | "following" | "not-following";

/**
 * Atualiza o status de follow de um jogador em uma lista, sem mutar o array
 * original. Usado pelos updates otimistas do React Query.
 */
export const setFollowingState = <T extends FollowablePlayer>(
  players: T[] | undefined,
  playerId: string,
  isFollowing: boolean
): T[] | undefined => {
  if (!players) return players;

  return players.map((player) =>
    player._id === playerId ? { ...player, isFollowing } : player
  );
};

/**
 * Aplica o filtro da tela de adicionar amigos.
 */
export const filterPlayers = <T extends FollowablePlayer>(
  players: T[],
  filter: PlayerFilter,
  loggedInPlayerId?: string
): T[] => {
  switch (filter) {
    case "following":
      return players.filter((player) => player.isFollowing);
    case "not-following":
      return players.filter(
        (player) =>
          !player.isFollowing && player._id !== loggedInPlayerId
      );
    default:
      return players;
  }
};
