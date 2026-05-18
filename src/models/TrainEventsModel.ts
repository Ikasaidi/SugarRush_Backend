import { Schema, model, Types } from "mongoose";
import { regex } from "../utils/regex";
import { ITrainEvents } from "../interfaces/ITrainEvents";

const trainEventsSchema = new Schema<ITrainEvents>({
  train_schedule_id: { type: Types.ObjectId, ref: "TrainSchedules", required: true },

  station: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    match: regex.nameRegex,
  },

  event_type: {
    type: String,
    enum: ["arrival", "departure"],
    required: true,
  },

  details: {
    type: String,
    maxlength: 500,
  },

  event_time: { type: Date },
});

export const TrainEventsModel = model<ITrainEvents>("TrainEvents", trainEventsSchema);