import { z } from "zod";
import { objectIdSchema } from "./common";

const objectId = objectIdSchema;

export const matchSchema = z.object({
  gametype: z.enum(["bolinho", "par_ou_impar"]),
  gamemode: z.enum(["parceirada", "cara_a_cara"]),
  teamA: z.array(objectId).min(1, "Selecione ao menos um jogador no time A"),
  teamB: z.array(objectId).min(1, "Selecione ao menos um jogador no time B"),
  finalizer: objectId,
});

export const updateMatchResultSchema = z.object({
  winner: z.enum(["teamA", "teamB"]),
  finalizer: objectId,
});

export const editMatchBodySchema = z.object({
  gamemode: z.enum(["parceirada", "cara_a_cara"]),
  gametype: z.enum(["bolinho", "par_ou_impar"]),
  teamA: z.array(objectId).min(1, "Selecione ao menos um jogador no time A"),
  teamB: z.array(objectId).min(1, "Selecione ao menos um jogador no time B"),
  finalizerId: objectId,
});

export const editMatchAfterFinishedBodySchema = z.object({
  finalizerId: objectId,
  newWinner: z.enum(["teamA", "teamB"]).optional(),
  newTeamA: z.array(objectId).optional(),
  newTeamB: z.array(objectId).optional(),
});

export const matchIdParamSchema = z.object({
  id: objectIdSchema,
});

export { objectIdSchema };
