import { Router } from "express";
import { TrainSchedulesController } from "../controllers/TrainSchedulesController";

const router = Router();

const trainSchedulesController =
  new TrainSchedulesController();

router.get(
  "/",
  trainSchedulesController.getAllSchedules
);

router.get(
  "/upcoming",
  trainSchedulesController.getUpcomingSchedules
);

router.get(
  "/train/:trainId",
  trainSchedulesController.getSchedulesByTrain
);

export default router;