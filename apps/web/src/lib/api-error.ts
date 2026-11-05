import axios from "axios";

interface ApiErrorPayload {
  error?: unknown;
  message?: unknown;
  details?: unknown;
}

const DEFAULT_ERROR_MESSAGE = "Algo deu errado. Tente novamente.";

/**
 * Extrai a mensagem de erro mais útil possível de uma resposta da API.
 *
 * A API padroniza os erros no formato { error, message, details? }, mas
 * mantemos fallbacks para erros de rede, timeout e respostas antigas.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback: string = DEFAULT_ERROR_MESSAGE
): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorPayload | undefined;

    if (typeof data?.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data?.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "A requisição demorou demais. Tente novamente.";
    }

    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
    }

    switch (error.response.status) {
      case 401:
        return "Sua sessão expirou. Faça login novamente.";
      case 403:
        return "Você não tem permissão para realizar esta ação.";
      case 404:
        return "Recurso não encontrado.";
      case 429:
        return "Muitas requisições. Aguarde alguns minutos e tente novamente.";
      default:
        if (error.response.status >= 500) {
          return "Erro interno do servidor. Tente novamente mais tarde.";
        }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
