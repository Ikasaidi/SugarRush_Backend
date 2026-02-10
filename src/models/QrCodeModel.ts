import { Schema, model, Types } from "mongoose";
import { regex } from "../utils/regex";
import { IQrCode } from "../interfaces/IQRCode";
import { boolean } from "zod";

const qrCodeSchema = new Schema<IQrCode>({
  user_id: { type: Types.ObjectId, ref: "User", required: true },
  is_valid: { type: Boolean, required: true},
  qr_url: { type: String, required: true, min: 0 },
  created_at: { type: Date, default: () => new Date() },
});

export const QrCodeModel = model<IQrCode>("Purchases", qrCodeSchema);