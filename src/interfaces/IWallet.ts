import { Document, Types } from "mongoose";

export interface IWallet extends Document {
  user_id: Types.ObjectId;
  free_ticket_balance: number;
  paid_ticket_balance: number;
  updated_at?: Date;
}