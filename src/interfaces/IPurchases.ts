import { Document, Types } from "mongoose";

export interface IPurchases extends Document {
  user_id: Types.ObjectId;
  quantity: number;
  unit_price: number;
  total_amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  created_at?: Date;
}