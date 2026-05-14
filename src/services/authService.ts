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

      // ==================================================
      // CHECK EMAIL
      // ==================================================

      const existingEmail = await UserModel.findOne({
        email: cleanEmail,
      }).session(session);

      if (existingEmail) {
        throw new HttpException(409, "Cet email existe déjà");
      }

      // ==================================================
      // CHECK USERNAME
      // ==================================================

      const existingUsername = await UserModel.findOne({
        username: data.username.trim(),
      }).session(session);

      if (existingUsername) {
        throw new HttpException(409, "Ce username existe déjà");
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
      // GENERATE TOKEN
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
    }).select("+password");

    if (!user) {
      throw new HttpException(401, "Identifiants invalides");
    }

    const isMatch = await comparePassword(password.trim(), user.password);

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
