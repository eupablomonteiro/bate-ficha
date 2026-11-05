export interface AuthFormData {
  name?: string;
  nickname: string;
  password: string;
  confirmPassword?: string;
}

export interface Player {
  _id: string;
  name: string;
  nickname: string;
  avatarUrl: string;
  totalMatchesSolo: number;
  totalMatchesTeam: number;
  pointsSolo: number;
  pointsTeam: number;
  soloWins: number;
  soloLosses: number;
  teamWins: number;
  teamLosses: number;
  followers: string[];
  following: string[];
  partners: string[];
}