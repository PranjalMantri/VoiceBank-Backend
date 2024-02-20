import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createLoan,
  deleteLoan,
  getLoan,
} from "../controllers/loan.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createLoan);
router.route("/:loanId").get(getLoan).delete(deleteLoan);

export default router;
gpt
