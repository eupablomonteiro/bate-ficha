import { describe, it, expect } from "vitest";
import axios from "axios";
import { getApiErrorMessage } from "../api-error";

describe("getApiErrorMessage", () => {
  it("prioriza message da API", () => {
    const error = new axios.AxiosError("fail");
    error.response = {
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as any,
      data: { error: "AlreadyFollowing", message: "Você já está seguindo este jogador." },
    };
    expect(getApiErrorMessage(error)).toBe("Você já está seguindo este jogador.");
  });

  it("usa fallback para erro desconhecido", () => {
    expect(getApiErrorMessage(new Error(""))).toBe("Algo deu errado. Tente novamente.");
  });
});
