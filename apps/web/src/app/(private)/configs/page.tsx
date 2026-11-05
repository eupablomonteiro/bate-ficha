"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import PrivateLayout from "@/layouts/PrivateLayout";
import withAuth from "@/hoc/withAuth";
import React, { useState, useEffect } from "react";
import { Cookie, Hourglass, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserSettings } from "@/context/UserSettingsContext";
import { useAnimation } from "@/context/AnimationContext";

const Configs = () => {
  const { toast } = useToast();
  const [enableTransition, setEnableTransition] = useState(true);
  const [transitionDuration, setTransitionDuration] = useState(2000);
  const [acceptCookies, setAcceptCookies] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const { allowCookies, updateAllowCookies } =
    useUserSettings();
  const { settings, updateSettings, isLoading } = useAnimation();
  const [localDuration, setLocalDuration] = useState(settings.transitionDuration);
  const [isDurationChanged, setIsDurationChanged] = useState(false);

  // Carregar configurações do localStorage quando a página carregar
  useEffect(() => {
    // Carregar configuração de cookies
    const savedCookieConfig = localStorage.getItem("acceptCookies");
    if (savedCookieConfig) {
      setAcceptCookies(savedCookieConfig === "true");
    }

    // Carregar configurações de transição
    const savedTransitionConfig = localStorage.getItem("enableTransition");
    if (savedTransitionConfig) {
      setEnableTransition(savedTransitionConfig === "true");
    }

    const savedDurationConfig = localStorage.getItem("transitionDuration");
    if (savedDurationConfig) {
      setTransitionDuration(parseInt(savedDurationConfig));
    }
  }, []);

  // Monitorar mudanças nas configurações
  useEffect(() => {
    // Verificar se algo mudou em relação ao que está salvo
    const savedCookieConfig = localStorage.getItem("acceptCookies") === "true";
    const savedTransitionConfig =
      localStorage.getItem("enableTransition") === "true";
    const savedDurationConfig = parseInt(
      localStorage.getItem("transitionDuration") || "2000"
    );

    const hasChanges =
      savedCookieConfig !== acceptCookies ||
      savedTransitionConfig !== enableTransition ||
      savedDurationConfig !== transitionDuration;

    setIsChanged(hasChanges);
  }, [acceptCookies, enableTransition, transitionDuration]);

  // Atualizar estado local quando as configurações carregarem
  useEffect(() => {
    setLocalDuration(settings.transitionDuration);
  }, [settings.transitionDuration]);

  // Verificar mudanças
  useEffect(() => {
    setIsDurationChanged(localDuration !== settings.transitionDuration);
  }, [localDuration, settings.transitionDuration]);

  const handleSaveConfigs = () => {
    // Salvar configurações no localStorage
    localStorage.setItem("acceptCookies", acceptCookies.toString());
    localStorage.setItem("enableTransition", enableTransition.toString());
    localStorage.setItem("transitionDuration", transitionDuration.toString());

    // Aplicar configurações na aplicação
    // (você pode adicionar lógica adicional conforme necessário)

    // Mostrar feedback ao usuário
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });

    setIsChanged(false);
  };

  const formatDuration = (ms: number) => {
    return (ms / 1000).toFixed(1) + "s";
  };

  const handleToggleCookies = async (checked: boolean) => {
    await updateAllowCookies(checked);
  };

  const handleSaveAnimationSettings = async () => {
    await updateSettings({
      transitionDuration: localDuration
    });
    setIsDurationChanged(false);
  };

  const handleToggleAnimations = async (enabled: boolean) => {
    await updateSettings({ enabled });
  };

  return (
    <PrivateLayout>
      <div className="container mx-auto max-w-md p-4">
        <h1 className="flex gap-2 items-center text-xl font-bold mb-6 text-zinc-200">
          <Settings className="text-green-500" /> Configurações
        </h1>

        <div className="space-y-6">
          {/* Configuração de Cookies */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2">
                <Cookie size={20} />
                Políticas de Cookies
              </CardTitle>
              <CardDescription>
                Gerenciar como seus dados são armazenados nesta aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                {/* Área do switch com status mais visível */}
                <Label
                  htmlFor="cookies-consent"
                  className="relative flex items-center justify-between p-3 bg-zinc-800/80 rounded-lg border border-zinc-700"
                >
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">
                      {allowCookies
                        ? "Cookies ativados"
                        : "Cookies desativados"}
                    </div>
                    <p className="text-sm text-zinc-400">
                      {allowCookies
                        ? "Suas preferências estão sendo salvas"
                        : "Suas preferências não estão sendo salvas"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1 absolute -top-3 right-3">
                    <Switch
                      id="cookies-consent"
                      checked={allowCookies}
                      onCheckedChange={handleToggleCookies}
                      className="w-5 h-5 rounded-full data-[state=checked]:bg-green-500 bg-zinc-400"
                    />
                    <span className="text-xs text-zinc-300">
                      {allowCookies ? "Desativar" : "Ativar"}
                    </span>
                  </div>
                </Label>

                {/* Informações sobre cookies */}
                <div className="p-3 bg-zinc-800/50 rounded-lg text-sm text-zinc-400">
                  <p>
                    Ao permitir cookies, você concorda que a aplicação armazene
                    informações sobre suas preferências e configurações em seu
                    dispositivo.
                  </p>
                  <p className="mt-2">
                    Estas informações são usadas para personalizar sua
                    experiência e não são compartilhadas com terceiros.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuração de Animações */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2">
                <Hourglass size={20} />
                Animações
              </CardTitle>
              <CardDescription>
                Configurar a exibição das animações de carregamento
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-4">
                {/* Toggle para ativar/desativar animações */}
                <Label htmlFor="enable-animations" className="relative flex items-center justify-between p-3 bg-zinc-800/80 rounded-lg border border-zinc-700">
                  <div className="space-y-0.5">
                    <div className="text-base font-medium">
                      {settings.enabled ? "Animações ativadas" : "Animações desativadas"}
                    </div>
                    <p className="text-sm text-zinc-400">
                      {settings.enabled 
                        ? "Transições suaves entre telas" 
                        : "Navegação instantânea entre telas"}
                    </p>
                  </div>
                  <Switch 
                    id="enable-animations"
                    checked={settings.enabled}
                    onCheckedChange={handleToggleAnimations}
                    className="w-5 h-5 absolute -top-3 right-3 rounded-full data-[state=checked]:bg-green-500 bg-zinc-400"
                  />
                </Label>

                {/* Controle de duração (apenas visível se animações estiverem ativadas) */}
                {settings.enabled && (
                  <div className="space-y-3 p-3 bg-zinc-800/80 rounded-lg border border-zinc-700">
                    <div className="flex justify-between items-center">
                      <Label>Tempo de exibição</Label>
                      <span className="text-sm font-medium bg-zinc-700 px-2 py-1 rounded">
                        {localDuration === 0 ? "Instantâneo" : `${localDuration.toFixed(1)}s`}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={[localDuration]}
                      onValueChange={(values) => setLocalDuration(values[0])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Instantâneo</span>
                      <span>2s (Padrão)</span>
                    </div>
                    
                    {isDurationChanged && (
                      <Button 
                        onClick={handleSaveAnimationSettings}
                        className="w-full mt-2 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Salvar alteração
                      </Button>
                    )}
                  </div>
                )}

                <div className="p-3 bg-zinc-800/50 rounded-lg text-sm text-zinc-400">
                  <p>
                    Você pode desativar completamente as animações ou ajustar 
                    por quanto tempo elas serão exibidas durante a navegação.
                  </p>
                  {settings.enabled && (
                    <p className="mt-2">
                      Tempo atual: {settings.transitionDuration === 0 
                        ? "Instantâneo" 
                        : `${settings.transitionDuration.toFixed(1)} segundos`}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default withAuth(Configs);
