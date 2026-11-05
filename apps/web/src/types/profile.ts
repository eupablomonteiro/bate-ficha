import { Player } from "./auth";

export interface ProfileStats {
  totalMatchesSolo: number;
  totalMatchesTeam: number;
  soloWins: number;
  soloLosses: number;
  teamWins: number;
  teamLosses: number;
  pointsSolo: number;
  pointsTeam: number;
  winRate: number;
}

export interface BestPartnerType {
  _id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
}

export interface PlayerProfileData extends Player, ProfileStats {}