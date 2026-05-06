import { Schema, model, Types } from "mongoose";
import { IQrCode } from "../interfaces/IQRCode";

const qrCodeSchema = new Schema<IQrCode>({
  user_id: { type: Types.ObjectId, ref: "User", required: true },
  is_valid: { type: Boolean, required: true},
  qr_url: { type: String, required: true },
  qr_payload: { type: String, required: true },
  created_at: { type: Date, default: () => new Date() },
});

export const QrCodeModel = model<IQrCode>("QrCodes", qrCodeSchema);