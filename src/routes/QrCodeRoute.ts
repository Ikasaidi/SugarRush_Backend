import { Router } from "express";
import {
  createQrCodeHandler,
  validateQrCodeHandler,
} from "../controllers/QrCodeController";

const router = Router();

router.post("/generate", createQrCodeHandler);
router.post("/validate", validateQrCodeHandler);

export default router;
