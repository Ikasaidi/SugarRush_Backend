import { Document, Types } from "mongoose";

export interface IAuth extends Document {
  user_id: Types.ObjectId;
  password_hash: string;
  token_expires_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}