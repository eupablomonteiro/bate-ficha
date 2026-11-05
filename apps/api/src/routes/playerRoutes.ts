import express from "express";
import { authenticate } from "../middleware/auth";
import { uploadMiddleware } from "../middleware/multer";
import {
  searchPlayers,
  getPlayerByNickname,
  getPlayerById,
  getAllPlayers,
  updatePlayer,
  deletePlayer,
  deleteAllPlayers,
  getBestPartner,
  getAllFollowPlayers,
  getLastFiveMatchesByGamemode,
} from "../controllers/playerController";
import { validateBody, validateParams, validateQuery } from "../middleware/validate";
import {
  searchQuerySchema,
  nicknameParamSchema,
  idParamSchema,
  updatePlayerSchema,
} from "../validations/playerValidations";
import { gamemodeQuerySchema } from "../validations/common";

const router = express.Router();

router.get("/player/search", authenticate, validateQuery(searchQuerySchema), searchPlayers);
router.get("/player/getIdent/:id", authenticate, validateParams(idParamSchema), getPlayerById);
router.get("/player/getNick/:nickname", authenticate, validateParams(nicknameParamSchema), getPlayerByNickname);
router.get("/player/get-all", authenticate, getAllPlayers);
router.get("/player/:id/best-partner", authenticate, validateParams(idParamSchema), getBestPartner);
router.get("/player/ranking", authenticate, getAllFollowPlayers);
router.get(
  "/player/getLastFiveMatchesByGamemode",
  authenticate,
  validateQuery(gamemodeQuerySchema),
  getLastFiveMatchesByGamemode
);
router.put(
  "/player/update/:id",
  authenticate,
  validateParams(idParamSchema),
  uploadMiddleware,
  validateBody(updatePlayerSchema),
  updatePlayer
);
router.delete("/player/delete/:id", authenticate, validateParams(idParamSchema), deletePlayer);
router.delete("/player/delete-all", authenticate, deleteAllPlayers);

export default router;
