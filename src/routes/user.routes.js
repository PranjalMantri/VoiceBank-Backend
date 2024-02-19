import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserById,
  updateUserDetails,
  deleteUser,
  updateUserPassword,
  getUserAccount,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router
  .route("/:userId")
  .get(verifyJWT, getUserById)
  .patch(verifyJWT, updateUserDetails)
  .delete(verifyJWT, deleteUser);

router.route("/update-password/:userId").patch(verifyJWT, updateUserPassword);
router.route("/a/:userId").get(verifyJWT, getUserAccount);

export default router;
