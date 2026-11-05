import { Player as AuthPlayer } from "./auth";

// Versão simplificada do Player para componentes de seleção
export interface SimplePlayer {
  _id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
}

export type GameType = "bolinho" | "par_ou_impar";
export type GameMode = "cara_a_cara" | "parceirada";
export type TeamType = "teamA" | "teamB";

export interface MatchFormValues {
  gametype: GameType | string;
  gamemode: GameMode | string;
  teamA: string[];
  teamB: string[];
  finalizer: string;
}

export interface Match {
  _id: string;
  gamemode: GameMode;
  gametype: GameType;
  status: "running" | "finished";
  teamA: AuthPlayer[];
  teamB: AuthPlayer[];
  players: AuthPlayer[];
  winner: TeamType | "";
  finalizer: AuthPlayer;
  createdAt: string;
  updatedAt: string;
} 