import axios from "axios";
import { destroyCookie, parseCookies } from "nookies";
import { BestPartnerType } from "@/types/profile";
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

let isRedirectingToLogin = false;

const clearAuthCookies = () => {
  if (typeof window === "undefined") return;

  destroyCookie(null, "token");
  destroyCookie(null, "player");
};

api.interceptors.request.use((config) => {
  const cookies = parseCookies();
  const token = cookies["token"];

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const isAuthEndpoint =
      url.includes("/auth/login") || url.includes("/auth/register");

    if (status === 401 && !isAuthEndpoint) {
      clearAuthCookies();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/" &&
        !isRedirectingToLogin
      ) {
        isRedirectingToLogin = true;
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  }
);

interface EditMatchData {
  gamemode: "cara_a_cara" | "parceirada";
  gametype: "bolinho" | "par_ou_impar";
  teamA: string[];
  teamB: string[];
  finalizerId: string;
}

interface EditFinishedMatchData {
  newWinner?: "teamA" | "teamB";
  finalizerId: string;
  newTeamA?: string[];
  newTeamB?: string[];
}


export const fetchBestPartner = async (playerId: string): Promise<BestPartnerType> => {
  const response = await api.get(`/player/${playerId}/best-partner`);
  return response.data;
};

export const fetchPlayerProfile = async (playerId: string) => {
  const response = await api.get(`/player/getIdent/${playerId}`);
  return response.data;
};

export const fecthLastFiveMatchesByGamemode = async (gamemode: "cara_a_cara" | "parceirada") => {
  const response = await api.get(`/player/getLastFiveMatchesByGamemode?gamemode=${gamemode}`)
  return response.data;
}

export const editMatch = async (matchId: string, data: EditMatchData) => {
  const response = await api.put(`/matches/edit/${matchId}`, data);
  return response.data;
};

export const editFinishedMatch = async (matchId: string, data: EditFinishedMatchData) => {
  const response = await api.put(`/matches/editAfterFinished/${matchId}`, data);
  return response.data;
};

export const handleFinishMatch = async (winner: "teamA" | "teamB", finalizer: string, matchId: string) => {
  const response = await api.post(`/matches/${matchId}/finish`, {
    winner,
    finalizer,
  });
  return response.data;
};

export default api;
