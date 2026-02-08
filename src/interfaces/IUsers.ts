import { Document, Types } from "mongoose";

export interface IUsers extends Document {
  username: string;
  email: string;
  password: string;
  user_type: "student" | "adult" | "senior";
  created_at?: Date;
  updated_at?: Date;
}