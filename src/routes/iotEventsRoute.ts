import { Router } from "express";
import { IotEventsController } from "../controllers/iotEventsController";

const router = Router();
const controller = new IotEventsController();

// POST : capteur → backend
router.post("/events", controller.receiveEvent);

// GET : récupérer les events d’un device
router.get("/events/:deviceId", controller.getDeviceEvents);

export default router;
