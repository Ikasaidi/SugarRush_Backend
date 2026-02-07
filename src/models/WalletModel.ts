import { Schema, model, Types } from "mongoose";
import { regex } from "../utils/regex";
import { IWallet } from "../interfaces/IWallet";

const walletSchema = new Schema<IWallet>({
  user_id: { type: Types.ObjectId, ref: "User", required: true },
  free_ticket_balance: { type: Number, default: 0, min: 0 },
  paid_ticket_balance: { type: Number, default: 0, min: 0 },
  updated_at: { type: Date, default: () => new Date() },
});

export const WalletModel = model<IWallet>("Wallet", walletSchema);