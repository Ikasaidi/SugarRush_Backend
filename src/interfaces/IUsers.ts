import { Document } from "mongoose";

export interface IUsers extends Document {
  username: string;
  email: string;
  password: string;
  user_type: "student" | "adult" | "senior" | "admin";

  fname: string;
  lname: string;
  phone: string;
  address: string;

  created_at?: Date;
  updated_at?: Date;
}