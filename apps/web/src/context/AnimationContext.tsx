"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";

interface AnimationSettings {
  enabled: boolean;
  transitionDuration: number;
}

interface AnimationContextType {
  settings: AnimationSettings;
  isLoading: boolean;
  isInitialized: boolean;
  updateSettings: (newSettings: Partial<AnimationSettings>) => Promise<void>;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
  const { player } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [settings, setSettings] = useState<AnimationSettings>({
    enabled: true,
    transitionDuration: 2.0
  });

  // Carregar configurações iniciais
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/settings/animations");
        setSettings(response.data);
        setIsInitialized(true);
      } catch (error) {
        console.error("Erro ao carregar configurações de animação:", error);
        toast({
          title: "Erro ao carregar configurações",
          description: getApiErrorMessage(
            error,
            "Não foi possível carregar suas configurações de animação."
          ),
          variant: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (player?._id) {
      fetchSettings();
    } else {
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, [player, toast]);

  const updateSettings = async (newSettings: Partial<AnimationSettings>) => {
    try {
      const response = await api.put("/settings/animations", newSettings);
      setSettings(response.data);
      
      toast({
        title: "Configurações atualizadas",
        description: "As configurações de animação foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar configurações:", error);
      toast({
        title: "Erro ao salvar",
        description: getApiErrorMessage(
          error,
          "Erro ao atualizar configurações."
        ),
        variant: "error",
      });
    }
  };

  return (
    <AnimationContext.Provider
      value={{
        settings,
        isLoading,
        isInitialized,
        updateSettings
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimation deve ser usado dentro de um AnimationProvider");
  }
  return context;
}; 