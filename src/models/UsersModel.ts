import { Schema, model } from "mongoose";
import { IUsers } from "../interfaces/IUsers";
import { regex } from "../utils/regex";

const userSchema = new Schema<IUsers>({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
    match: regex.usernameRegex,
  },
  email: {
    type: String,
    required: true,
    match: regex.emailRegex,
  },
  password: {
    type: String,
    required: true,
    match: regex.passwordRegex,
  },
  user_type: {
    type: String,
    enum: ["student", "adult", "senior"],
    required: true,
  },
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() },
});

export const UserModel = model<IUsers>("User", userSchema);