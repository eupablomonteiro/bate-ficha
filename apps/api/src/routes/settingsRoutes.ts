import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getUserSettings,
  updateUserSettings,
  getAnimationSettings,
  updateAnimationSettings,
} from "../controllers/settingsController";
import { validateBody } from "../middleware/validate";
import {
  updateSettingsSchema,
  updateAnimationSettingsSchema,
} from "../validations/settingsValidations";

const router = Router();

router.get("/settings", authenticate, getUserSettings);
router.put("/settings", authenticate, validateBody(updateSettingsSchema), updateUserSettings);
router.get("/settings/animations", authenticate, getAnimationSettings);
router.put(
  "/settings/animations",
  authenticate,
  validateBody(updateAnimationSettingsSchema),
  updateAnimationSettings
);

export default router;
