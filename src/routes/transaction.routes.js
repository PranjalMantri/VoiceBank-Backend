import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createDeposit,
  createTransaction,
  createWithdrawl,
  getTotalTransactionOfAccount,
  getTransactionFromId,
  getTransactionsByType,
} from "../controllers/transaction.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/transfer").post(createTransaction);
router.route("/deposit").post(createDeposit);
router.route("/withdrawl").post(createWithdrawl);
router.route("/:transactionId").get(getTransactionFromId);

router
  .route("/account-transactions/:accountId")
  .get(getTotalTransactionOfAccount);

router.route("/transaction-type/:accountId").get(getTransactionsByType);
export default router;
