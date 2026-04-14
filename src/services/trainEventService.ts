import { TrainEventsModel } from "../models/TrainEventsModel";
import { HttpException } from "../utils/http-exception";
import fetch from "node-fetch";


const TRAIN_API_URL = process.env.TRAIN_API_URL || "http://192.168.68.115";

export class TrainEventService {
 async startTrain() {
    try {
      await fetch(`${TRAIN_API_URL}/ouvrir`, { method: "POST" });
      return { status: "train started" };
    } catch (err) {
      throw new HttpException(500, "Impossible de démarrer le train");
    }
  }

    async stopTrain() {
    try {
      await fetch(`${TRAIN_API_URL}/fermer`, { method: "POST" });
      return { status: "train stopped" };
    } catch (err) {
      throw new HttpException(500, "Impossible d'arrêter le train");
    }
  }


}
