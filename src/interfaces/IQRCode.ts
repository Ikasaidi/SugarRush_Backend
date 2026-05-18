import { Document, Types } from "mongoose";

export interface IQrCode extends Document {
  user_id: Types.ObjectId;
  is_valid:boolean;
  qr_url: string;
  qr_payload: string;
  created_at?: Date;
 }