import { Schema, model, Types } from "mongoose";
import { regex } from "../utils/regex";
import { IPurchases } from "../interfaces/IPurchases";

const purchasesSchema = new Schema<IPurchases>({
  user_id: { type: Types.ObjectId, ref: "User", required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit_price: { type: Number, required: true, min: 0 },
  total_amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, match: regex.currencyRegex },
  status: { type: String, enum: ["pending", "completed", "failed"], required: true },
  created_at: { type: Date, default: () => new Date() },
});

export const PurchasesModel = model<IPurchases>("Purchases", purchasesSchema);