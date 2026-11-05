"use client";

import * as React from "react";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Player } from "@/types/auth";

interface AuthContextType {
  player: Player | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  updatePlayer: (updatedPlayer: Player) => void;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const logout = React.useCallback(() => {
    destroyCookie(null, "token");
    destroyCookie(null, "player");
    setPlayer(null);
    setIsAuthenticated(false);
    router.replace("/");
  }, [router]);

  React.useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      const cookies = parseCookies();
      const token = cookies.token;

      if (!token) {
        if (cookies.player) {
          destroyCookie(null, "player");
        }

        if (isMounted) {
          setPlayer(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await api.get("/auth/verify");

        if (!isMounted) return;

        const playerData = response.data.player;
        setPlayer(playerData);
        setIsAuthenticated(true);
        setCookie(null, "player", JSON.stringify(playerData), { path: "/" });
      } catch {
        if (!isMounted) return;

        setPlayer(null);
        setIsAuthenticated(false);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayer(updatedPlayer);
    setCookie(null, "player", JSON.stringify(updatedPlayer), {
      path: "/",
      maxAge: 60 * 60 * 5, 
    });
  }

  return (
    <AuthContext.Provider
      value={{ player, isAuthenticated, isLoading, logout, updatePlayer }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};
