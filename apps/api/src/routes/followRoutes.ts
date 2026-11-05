import express from "express";
import { followPlayer, unfollowPlayer, getFollowers, getFollowing } from "../controllers/followController";
import { authenticate } from "../middleware/auth";
import { validateParams } from "../middleware/validate";
import { followIdParamSchema } from "../validations/followValidations";

const router = express.Router();

router.post("/follow/:id", authenticate, validateParams(followIdParamSchema), followPlayer);
router.post("/unfollow/:id", authenticate, validateParams(followIdParamSchema), unfollowPlayer);
router.get("/followers", authenticate, getFollowers);
router.get("/following", authenticate, getFollowing);

export default router;
