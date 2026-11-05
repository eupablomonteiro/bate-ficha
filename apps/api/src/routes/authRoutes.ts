import express from "express";
import { registerPlayer, loginPlayer, verifyPlayer, logoutPlayer } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../validations/authValidations";

const router = express.Router();

router.post("/auth/register", validateBody(registerSchema), registerPlayer);
router.post("/auth/login", validateBody(loginSchema), loginPlayer);
router.get("/auth/verify", authenticate, verifyPlayer);
router.post("/auth/logout", authenticate, logoutPlayer);

export default router;
