import { Document, Types } from "mongoose";

export interface IQrCode extends Document {
  user_id: Types.ObjectId;
  is_valid:boolean;
  created_at?: Date;
  qr_url: string;
 }