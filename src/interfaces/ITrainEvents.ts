import { Document, Types } from "mongoose";

export interface ITrainEvents extends Document {
  train_schedule_id: Types.ObjectId;
  station: string;
  event_type: "arrival" | "departure";
  details?: string;
  event_time?: Date;
}