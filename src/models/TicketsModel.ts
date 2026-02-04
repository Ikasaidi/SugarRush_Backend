import { Schema, model, Types } from "mongoose";
import { regex } from "../utils/regex";
import { ITickets } from "../interfaces/ITickets";

const ticketsSchema = new Schema<ITickets>({
  user_id: { type: Types.ObjectId, ref: "User", required: true },
  train_schedule_id: { type: Types.ObjectId, ref: "TrainSchedule", required: true },
  ticket_type: { type: String, enum: ["paid", "free"], required: true },
  qr_code: { type: String, required: true, minlength: 10, maxlength: 500 },
  is_used: { type: Boolean, default: false },
  purchased_at: { type: Date },
  used_at: { type: Date },
});

export const TicketsModel = model<ITickets>("Tickets", ticketsSchema);