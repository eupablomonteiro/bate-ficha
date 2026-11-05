import { useUserSettings } from "@/context/UserSettingsContext";

// Esta função verifica se o usuário aceitou cookies antes de tentar salvar algo
export const saveToCookies = (key: string, value: string): boolean => {
  // Importar o contexto diretamente em uma função não é possível
  // Essa função deve ser chamada dentro de um componente que usa useUserSettings
  return false;
};

// Esta é uma versão para usar dentro de componentes
export const useCookieManager = () => {
  const { allowCookies } = useUserSettings();

  const saveToCookies = (key: string, value: string): boolean => {
    if (!allowCookies) return false;
    
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error);
      return false;
    }
  };

  const getFromCookies = <T>(key: string, defaultValue: T): T => {
    if (!allowCookies) return defaultValue;
    
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error("Erro ao ler do localStorage:", error);
      return defaultValue;
    }
  };

  const removeFromCookies = (key: string): boolean => {
    if (!allowCookies) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Erro ao remover do localStorage:", error);
      return false;
    }
  };

  return {
    saveToCookies,
    getFromCookies,
    removeFromCookies,
    allowCookies
  };
}; 