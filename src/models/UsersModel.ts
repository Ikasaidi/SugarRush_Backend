import mongoose, { Schema, model } from "mongoose";
import { IUsers } from "../interfaces/IUsers";
import bcrypt from "bcrypt";
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
    enum: ["student", "adult", "senior", "admin"],
    required: true,
  },

  fname: { type: String, required: true },
  lname: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (this: any) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export const UserModel = model<IUsers>("User", userSchema);
