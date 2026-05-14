import { Request, Response } from "express";
import { trainRuntimeState } from "../services/trainRuntimeState";

export class TrainStatusController {
  getStatus = async (req: Request, res: Response) => {
    return res.status(200).json({
      train_running: trainRuntimeState.trainRunning,
      service_status: trainRuntimeState.serviceStatus,
      last_known_station: trainRuntimeState.lastKnownStation,
      last_seen_at: trainRuntimeState.lastSeenAt,
      last_started_at: trainRuntimeState.lastStartedAt,
      last_stopped_at: trainRuntimeState.lastStoppedAt,
    });
  };
}