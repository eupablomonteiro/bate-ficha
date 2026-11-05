"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";

interface UserSettingsContextType {
  allowCookies: boolean;
  isLoadingSettings: boolean;
  updateAllowCookies: (value: boolean) => Promise<void>;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { player, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [allowCookies, setAllowCookies] = useState<boolean>(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Buscar configurações do usuário quando estiver autenticado
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated || !player?._id) {
        setIsLoadingSettings(false);
        return;
      }

      try {
        setIsLoadingSettings(true);
        const response = await api.get("/settings");
        setAllowCookies(response.data.allowCookies);
      } catch (error) {
        console.error("Erro ao buscar configurações:", error);
        toast({
          title: "Erro ao carregar configurações",
          description: getApiErrorMessage(
            error,
            "Não foi possível carregar suas preferências."
          ),
          variant: "error",
        });
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [isAuthenticated, player, toast]);

  // Função para atualizar a configuração de cookies
  const updateAllowCookies = async (value: boolean) => {
    // Atualizar o estado local imediatamente para feedback instantâneo
    setAllowCookies(value);
    
    // Se o usuário estiver autenticado, salvar no backend
    if (isAuthenticated && player?._id) {
      try {
        await api.put("/settings", { allowCookies: value });
        toast({
          title: "Configuração salva",
          description: value 
            ? "Cookies foram ativados para melhorar sua experiência." 
            : "Cookies foram desativados conforme sua preferência.",
        });
      } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        // Reverter estado em caso de erro
        setAllowCookies(!value);
        toast({
          title: "Erro ao salvar configuração",
          description: getApiErrorMessage(
            error,
            "Não foi possível atualizar suas preferências de cookies."
          ),
          variant: "error",
        });
      }
    }
  };

  return (
    <UserSettingsContext.Provider
      value={{
        allowCookies,
        isLoadingSettings,
        updateAllowCookies
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error("useUserSettings deve ser usado dentro de um UserSettingsProvider");
  }
  return context;
};