import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createLoan } from "../controllers/loan.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createLoan);
export default router;
