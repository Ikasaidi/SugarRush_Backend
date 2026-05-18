import { Router } from "express";
import { TrainStatusController } from "../controllers/TrainStatusController";

const router = Router();
const trainStatusController = new TrainStatusController();

router.get("/", trainStatusController.getStatus);
export default router;