import { Router } from "express";
import { TrainEventController } from "../controllers/trainEventController";
import { authMiddleware } from "../middlewares/authMiddleWare";

const router = Router();
const trainController = new TrainEventController();

// POST /api/train/start
router.post("/start", authMiddleware, trainController.startTrain);

// POST /api/train/stop
router.post("/stop", authMiddleware, trainController.stopTrain);

export default router;