import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { IUsers } from "../interfaces/IUsers";
import { regex } from "../utils/regex";

const userSchema = new Schema<IUsers>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      match: regex.usernameRegex,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: regex.emailRegex,
    },

    password: {
      type: String,
      required: true,
      match: regex.passwordRegex,
      select: false,
    },

    user_type: {
      type: String,
      enum: ["student", "adult", "senior", "admin"],
      required: true,
    },

    fname: {
      type: String,
      required: true,
      trim: true,
    },

    lname: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// ======================================================
// HASH PASSWORD BEFORE SAVE
// ======================================================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

export const UserModel = model<IUsers>(
  "User",
  userSchema
);