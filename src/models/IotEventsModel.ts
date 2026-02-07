import { Schema, model, Types } from "mongoose";
import { regex } from "../utils/regex";
import { IIotEvents } from "../interfaces/IIotEvents";

const iotEventsSchema = new Schema<IIotEvents>({
  device_id: { type: String, required: true },
  event_type: { type: String, required: true },
  station: { type: String, match: regex.nameRegex },
  payload: { type: String, required: true },
  created_at: { type: Date, default: () => new Date() },
});

export const IotEventsModel = model<IIotEvents>("IotEvents", iotEventsSchema);