import { useCallback } from "react";

const useStringUtils = () => {
  const getShortName = useCallback((fullName: string | undefined): string => {
    if (!fullName) return "";

    const names = fullName
      .trim()
      .split(/\s+/)
      .filter((name) => name.length > 0);

    if (names.length <= 2) {
      return fullName; // Retorna o nome completo se tiver 2 ou menos partes
    }
    return `${names[0]} ${names[names.length - 1]}`; // Retorna o primeiro nome e o último sobrenome
  }, []);

  const limitNickname = useCallback((nickname: string | undefined, limit: number = 10): string => {
    if (!nickname) return "";
    return nickname.length > limit ? nickname.slice(0, limit) + "..." : nickname;
  }, []);

  return { getShortName, limitNickname };
};

export default useStringUtils;