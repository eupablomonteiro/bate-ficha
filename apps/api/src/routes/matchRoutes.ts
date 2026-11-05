import express from "express";
import { createMatch, finishMatch, getMatchHistory, getMatchesByPlayer, getSoloMatchesByPlayerLogged, getTeamMatchesByPlayerLogged, deleteAllMatches, getMatchById, editMatch, editMatchAfterFinished } from "../controllers/matchController";
import { authenticate } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  matchSchema,
  updateMatchResultSchema,
  editMatchBodySchema,
  editMatchAfterFinishedBodySchema,
  matchIdParamSchema,
} from "../validations/matchValidations";
import { paginationQuerySchema } from "../validations/common";

const router = express.Router();

router.post("/matches/create", authenticate, validateBody(matchSchema), createMatch);
router.post("/matches/:id/finish", authenticate, validateParams(matchIdParamSchema), validateBody(updateMatchResultSchema), finishMatch);
router.put("/matches/edit/:id", authenticate, validateParams(matchIdParamSchema), validateBody(editMatchBodySchema), editMatch);
router.put("/matches/editAfterFinished/:id", authenticate, validateParams(matchIdParamSchema), validateBody(editMatchAfterFinishedBodySchema), editMatchAfterFinished);
router.get("/matches/history", authenticate, getMatchHistory);
router.get("/matches/history/:id", authenticate, validateParams(matchIdParamSchema), getMatchesByPlayer);
router.get("/matches/solo", authenticate, validateQuery(paginationQuerySchema), getSoloMatchesByPlayerLogged);
router.get("/matches/team", authenticate, validateQuery(paginationQuerySchema), getTeamMatchesByPlayerLogged);
router.get("/matches/:id", authenticate, validateParams(matchIdParamSchema), getMatchById);
router.delete("/matches/delete", authenticate, deleteAllMatches);

export default router;
