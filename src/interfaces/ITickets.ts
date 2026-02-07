import { Document, Types } from "mongoose";

export interface ITickets extends Document {
  user_id: Types.ObjectId;
  train_schedule_id: Types.ObjectId;
  ticket_type: "paid" | "free"
  qr_code: string;
  is_used: boolean;
  purchased_at?: Date;
  used_at?: Date;
}