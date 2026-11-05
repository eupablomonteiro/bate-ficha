"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface ConfigContextType {
  loadingScreenDuration: number;
  updateLoadingScreenDuration: (duration: number) => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [loadingScreenDuration, setLoadingScreenDuration] = useState<number>(2000); // Padrão 2s
  const { toast } = useToast();

  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    const savedDuration = localStorage.getItem("loadingScreenDuration");
    if (savedDuration) {
      setLoadingScreenDuration(parseInt(savedDuration));
    }
  }, []);

  // Função para atualizar a duração da tela de carregamento
  const updateLoadingScreenDuration = async (duration: number) => {
    // Garantir que a duração esteja dentro dos limites (máximo 2s)
    const validDuration = Math.min(duration, 2000);
    
    // Atualizar o estado local
    setLoadingScreenDuration(validDuration);
    
    // Salvar no localStorage
    localStorage.setItem("loadingScreenDuration", validDuration.toString());
    
    // Futura integração com backend
    try {
      // Descomente quando tiver o endpoint pronto
      // await api.post("/user/config", { loadingScreenDuration: validDuration });
      
      toast({
        title: "Configuração salva",
        description: "O tempo de exibição da tela de carregamento foi atualizado.",
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        title: "Erro ao salvar configurações",
        description: "A configuração foi salva localmente, mas não foi sincronizada com o servidor.",
        variant: "error"
      });
      
      return Promise.reject(error);
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        loadingScreenDuration,
        updateLoadingScreenDuration,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig deve ser usado dentro de um ConfigProvider");
  }
  return context;
};