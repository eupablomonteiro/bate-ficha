"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "@/components/loadingScreen";
import { useAnimation } from "@/context/AnimationContext";

interface RouteTransitionWrapperProps {
  children: React.ReactNode;
}

const RouteTransitionWrapper: React.FC<RouteTransitionWrapperProps> = ({
  children,
}: RouteTransitionWrapperProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const { settings } = useAnimation();

  useEffect(() => {
    // Só aplicar a animação se as configurações já foram carregadas e estiverem ativadas
    if (!settings.enabled) return;

    setIsLoading(true);

    const duration = settings.transitionDuration * 1000;
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [pathname, settings.enabled, settings.transitionDuration]);

  // Se animações estiverem desativadas, apenas renderizar o conteúdo
  if (!settings.enabled) {
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
