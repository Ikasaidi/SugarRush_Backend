import { Request, Response, NextFunction } from "express";
import { TrainEventService } from "../services/trainEventService";

const trainEventService = new TrainEventService();

export class TrainEventController {

  // POST /api/train/start
  // - Démarre le train (ouvre le système)
  startTrain = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await trainEventService.startTrain();
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/train/stop
  // - Arrête le train (ferme le système)
  stopTrain = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await trainEventService.stopTrain();
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };
}