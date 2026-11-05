import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";
import { registerSchema, loginSchema } from "../validations/authValidations";
import { updatePlayerSchema } from "../validations/playerValidations";
import { matchSchema, updateMatchResultSchema, editMatchBodySchema } from "../validations/matchValidations";
import { updateSettingsSchema, updateAnimationSettingsSchema } from "../validations/settingsValidations";
import { ErrorSchema } from "./registry";

extendZodWithOpenApi(z);

const BearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const security = [{ BearerAuth: [] }];

// Auth
registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  request: { body: { content: { "application/json": { schema: registerSchema } } } },
  responses: {
    201: { description: "Jogador registrado" },
    400: { description: "Erro de validação", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  request: { body: { content: { "application/json": { schema: loginSchema } } } },
  responses: {
    200: { description: "Login realizado" },
    400: { description: "Credenciais inválidas", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/verify",
  tags: ["Auth"],
  security,
  responses: { 200: { description: "Jogador autenticado" }, 401: { description: "Não autorizado" } },
});

// Player
registry.registerPath({
  method: "get",
  path: "/player/get-all",
  tags: ["Player"],
  security,
  responses: { 200: { description: "Lista de jogadores" } },
});

registry.registerPath({
  method: "get",
  path: "/player/search",
  tags: ["Player"],
  security,
  request: { query: z.object({ query: z.string() }) },
  responses: { 200: { description: "Resultados da busca" } },
});

registry.registerPath({
  method: "get",
  path: "/player/getNick/{nickname}",
  tags: ["Player"],
  security,
  request: { params: z.object({ nickname: z.string() }) },
  responses: { 200: { description: "Jogador" }, 404: { description: "Não encontrado" } },
});

registry.registerPath({
  method: "put",
  path: "/player/update/{id}",
  tags: ["Player"],
  security,
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "multipart/form-data": { schema: updatePlayerSchema } } },
  },
  responses: { 200: { description: "Perfil atualizado" } },
});

// Match
registry.registerPath({
  method: "post",
  path: "/matches/create",
  tags: ["Match"],
  security,
  request: { body: { content: { "application/json": { schema: matchSchema } } } },
  responses: { 201: { description: "Partida criada" } },
});

registry.registerPath({
  method: "post",
  path: "/matches/{id}/finish",
  tags: ["Match"],
  security,
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: updateMatchResultSchema } } },
  },
  responses: { 200: { description: "Partida finalizada" } },
});

registry.registerPath({
  method: "put",
  path: "/matches/edit/{id}",
  tags: ["Match"],
  security,
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: editMatchBodySchema } } },
  },
  responses: { 200: { description: "Partida editada" } },
});

// Follow
registry.registerPath({
  method: "post",
  path: "/follow/{id}",
  tags: ["Follow"],
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: "Seguindo" }, 400: { description: "Já segue" } },
});

registry.registerPath({
  method: "post",
  path: "/unfollow/{id}",
  tags: ["Follow"],
  security,
  request: { params: z.object({ id: z.string() }) },
  responses: { 200: { description: "Deixou de seguir" } },
});

// Settings
registry.registerPath({
  method: "get",
  path: "/settings",
  tags: ["Settings"],
  security,
  responses: { 200: { description: "Configurações" } },
});

registry.registerPath({
  method: "put",
  path: "/settings",
  tags: ["Settings"],
  security,
  request: { body: { content: { "application/json": { schema: updateSettingsSchema } } } },
  responses: { 200: { description: "Configurações atualizadas" } },
});

registry.registerPath({
  method: "get",
  path: "/settings/animations",
  tags: ["Settings"],
  security,
  responses: { 200: { description: "Configurações de animação" } },
});

registry.registerPath({
  method: "put",
  path: "/settings/animations",
  tags: ["Settings"],
  security,
  request: { body: { content: { "application/json": { schema: updateAnimationSettingsSchema } } } },
  responses: { 200: { description: "Configurações de animação atualizadas" } },
});
