
import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";

import {
  getMyProfileController,
  updateMyProfileController,
  getPublicProfileController,
} from "./users.controller";

const router = Router();

router.get("/me", authenticate, getMyProfileController);

router.patch("/me", authenticate, updateMyProfileController);

router.get("/:username", getPublicProfileController);

export default router;
