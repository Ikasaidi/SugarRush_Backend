import { Schema, model, Types } from "mongoose";
import { regex } from "../utils/regex";
import { IAuth } from "../interfaces/IAuth";

const authSchema = new Schema<IAuth>({
  user_id: { type: Types.ObjectId, ref: "User", required: true },
  password_hash: { type: String, required: true },
  token_expires_at: { type: Date },
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() },
});

export const AuthModel = model<IAuth>("Auth", authSchema);