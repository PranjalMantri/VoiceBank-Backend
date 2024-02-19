import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAccount } from "../controllers/account.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createAccount);

export default router;
