import { Schema, model, Types } from "mongoose";
import { regex } from "../utils/regex";
import { ITrainSchedules } from "../interfaces/ITrainSchedules";

const trainSchedulesSchema = new Schema<ITrainSchedules>({
  train_id: { type: String, required: true },
  departure_station: { type: String, required: true, match: regex.nameRegex },
  arrival_station: { type: String, required: true, match: regex.nameRegex },
  departure_time: { type: Date, required: true },
  arrival_time: { type: Date, required: true },
  created_at: { type: Date, default: () => new Date() },
});

export const TrainSchedulesModel = model<ITrainSchedules>("TrainSchedules", trainSchedulesSchema);