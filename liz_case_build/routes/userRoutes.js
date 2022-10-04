import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

router.post("/register", new userController().signup_post);
router.post(
  "/login",
  new userController().login_check,
  new userController().login_post
);
router.get("/logout", new userController().logout_get);
router.get("/logouth", new userController().logout_get_home);

export default router;
