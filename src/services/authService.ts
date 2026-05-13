import { UserModel } from "../models/UsersModel";
import { HttpException } from "../utils/http-exception";
import { comparePassword } from "../utils/bcryptHelp";
import { generateToken } from "../utils/jwtHelp";
import { WalletModel } from "../models/WalletModel";
import mongoose from "mongoose";

// ===========================================================
// AUTH SERVICE
// ===========================================================

export class AuthService {
async register(data: {
    email: string;
    username: string;
    password: string;
    user_type: "student" | "adult" | "senior";
  }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log("REGISTER START - Email:", data.email);

      // Vérification existence
      const exists = await UserModel.findOne({
        email: data.email.toLowerCase().trim(),
      }).session(session);

      if (exists) {
        throw new HttpException(409, "Cet email est déjà enregistré");
      }

      // ==================== CRÉATION UTILISATEUR ====================
      const users = await UserModel.create(
        [
          {
            email: data.email.trim().toLowerCase(),
            username: data.username.trim(),
            password: data.password.trim(),
            user_type: data.user_type,
          },
        ],
        { session }
      );

      const user = users[0];

      if (!user) {
        throw new Error("Échec de la création de l'utilisateur");
      }

      console.log("✅ USER CREATED:", user._id);

      // ==================== CRÉATION WALLET ====================
      const wallets = await WalletModel.create(
        [
          {
            user_id: user._id,
            free_ticket_balance: 0,
            paid_ticket_balance: 0,
          },
        ],
        { session }
      );

      const wallet = wallets[0];

      if (!wallet) {
        throw new Error("Échec de la création du wallet");
      }

      console.log("✅ WALLET CREATED:", wallet._id);

      await session.commitTransaction();

      return {
        id: user._id,
        email: user.email,
        username: user.username,
        user_type: user.user_type,
      };
    } catch (err: any) {
      await session.abortTransaction();
      console.error("❌ REGISTER ERROR:", {
        name: err.name,
        message: err.message,
        code: err.code,
        keyValue: err.keyValue,
      });

      if (err.code === 11000) {
        throw new HttpException(409, "Un wallet existe déjà pour cet utilisateur");
      }

      throw err;
    } finally {
      session.endSession();
    }
  }

  // =======================================================
  // LOGIN
  // =======================================================

  async login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: cleanEmail });

    if (!user) {
      throw new HttpException(401, "Identifiants invalides");
    }

    const ok = await comparePassword(password.trim(), user.password);

    if (!ok) {
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
      },
    };
  }
}
