import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createAccount,
  getAccount,
  getAccountOwner,
} from "../controllers/account.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createAccount);
router.route("/:accountId").get(getAccount);
router.route("/owner/:accountId").get(getAccountOwner);

export default router;
