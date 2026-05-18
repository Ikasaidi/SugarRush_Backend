import { Router } from "express";
import walletController from "../controllers/walletController";
import { authMiddleware } from "../middlewares/authMiddleWare";

const router = Router();

router.get("/me", authMiddleware, walletController.me);

export default router;
