"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "@/components/loadingScreen";
import { useAnimation } from "@/context/AnimationContext";

interface RouteTransitionWrapperProps {
  children: React.ReactNode;
}

const RouteTransitionWrapper: React.FC<RouteTransitionWrapperProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const { settings, isInitialized } = useAnimation();

  useEffect(() => {
    // Só aplicar a animação se as configurações já foram carregadas
    if (!isInitialized) return;

    // Se as animações estiverem desativadas ou duração for 0, não mostrar loading
    if (!settings.enabled || settings.transitionDuration === 0) return;
    
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, settings.transitionDuration * 1000); // Converter segundos para milissegundos

    return () => clearTimeout(timer);
  }, [pathname, settings, isInitialized]);

  // Se as configurações ainda não foram carregadas, não renderizar nada
  if (!isInitialized) {
    return null;
  }

  // Se animações estiverem desativadas, apenas renderizar o conteúdo
  if (!settings.enabled || settings.transitionDuration === 0) {
    return <>{children}</>;
  }

  return (
    <>
      {isLoading && <LoadingScreen />}
      {children}
    </>
  );
};

export default RouteTransitionWrapper;
