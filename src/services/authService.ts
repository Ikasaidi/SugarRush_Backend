import mongoose from "mongoose";
import { UserModel } from "../models/UsersModel";
import { WalletModel } from "../models/WalletModel";
import { HttpException } from "../utils/http-exception";
import { comparePassword } from "../utils/bcryptHelp";
import { generateToken } from "../utils/jwtHelp";

export class AuthService {

  // ======================================================
  // REGISTER
  // ======================================================

  async register(data: {
    email: string;
    username: string;
    password: string;
    user_type: "student" | "adult" | "senior" | "admin";
    fname: string;
    lname: string;
    phone: string;
    address: string;
  }) {

    const session = await mongoose.startSession();

    try {

      session.startTransaction();

      const cleanEmail = data.email.trim().toLowerCase();

      // Vérifie si email déjà utilisé
      const existingUser = await UserModel.findOne({
        email: cleanEmail,
      });

      if (existingUser) {
        throw new HttpException(409, "Cet email existe déjà");
      }

      // ==================================================
      // CREATE USER
      // ==================================================

      const user = new UserModel({
        email: cleanEmail,
        username: data.username.trim(),
        password: data.password.trim(),
        user_type: data.user_type,

        fname: data.fname.trim(),
        lname: data.lname.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
      });

      // IMPORTANT:
      // save() déclenche le pre("save")
      // donc le password sera hashé
      await user.save({ session });

      // ==================================================
      // CREATE WALLET
      // ==================================================

      const wallet = new WalletModel({
        user_id: user._id,
        free_ticket_balance: 0,
        paid_ticket_balance: 0,
      });

      await wallet.save({ session });

      // ==================================================
      // TOKEN
      // ==================================================

      const token = generateToken({
        id: user._id,
        email: user.email,
      });

      await session.commitTransaction();

      return {
        token,

        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          user_type: user.user_type,

          fname: user.fname,
          lname: user.lname,
          phone: user.phone,
          address: user.address,
        },
      };

    } catch (err) {

      await session.abortTransaction();
      throw err;

    } finally {

      session.endSession();

    }
  }

  // ======================================================
  // LOGIN
  // ======================================================

  async login(email: string, password: string) {

    const cleanEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({
      email: cleanEmail,
    });

    if (!user) {
      throw new HttpException(401, "Identifiants invalides");
    }

    // DEBUG
    console.log("PASSWORD FRONT:", password);
    console.log("PASSWORD DB:", user.password);

    const isMatch = await comparePassword(
      password.trim(),
      user.password
    );

    if (!isMatch) {
      throw new HttpException(401, "Identifiants invalides");
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
    });

    return {
      token,

      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        user_type: user.user_type,

        fname: user.fname,
        lname: user.lname,
        phone: user.phone,
        address: user.address,
      },
    };
  }
}