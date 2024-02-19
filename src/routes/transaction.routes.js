import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createDeposit,
  createTransaction,
} from "../controllers/transaction.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/transfer").post(createTransaction);
router.route("/deposit").post(createDeposit);

export default router;
