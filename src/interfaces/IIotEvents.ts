import { Document, Types } from "mongoose";

export interface IIotEvents extends Document {
  device_id: string;
  event_type: string;
  station?: string;
  payload: string
  created_at?: Date;
}