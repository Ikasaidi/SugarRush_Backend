import { UserModel } from "../models/UsersModel";
import { HttpException } from "../utils/http-exception";
import { comparePassword } from "../utils/bcryptHelp";
import { generateToken } from "../utils/jwtHelp";
import { WalletModel } from "../models/WalletModel";

// ===========================================================
// AUTH SERVICE
// - Inscription, Connexion, Promotion admin
// ===========================================================

export class AuthService {
  // ---------------------------------------------------------
  // REGISTER
  // - Crée un Users si l'email n'existe pas encore
  // - 409 si email déjà utilisé
  // - Premier compte → admin sinon Users
  // ---------------------------------------------------------
  async register(data: {
    email: string;
    username: string;
    password: string;
    user_type: "student" | "adult" | "senior";
  }) {
    const exists = await UserModel.findOne({ email: data.email });
    if (exists) throw new HttpException(409, "Cet email est déjà enregistré");

    const created = await UserModel.create({
      email: data.email.trim().toLowerCase(),
      username: data.username.trim(),
      password: data.password.trim(),
      user_type: data.user_type,
    });

    // retour sans password
    return {
      id: created._id,
      email: created.email,
      username: created.username,
      user_type: created.user_type,
    };
  }

  // ---------------------------------------------------------
  // LOGIN
  // - Vérifie email + mot de passe
  // - 401 si invalide, sinon renvoie un JWT + infos Users
  // ---------------------------------------------------------
  async login(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();

    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user) throw new HttpException(401, "Identifiants invalides");

    const ok = await comparePassword(password.trim(), user.password);
    if (!ok) throw new HttpException(401, "Identifiants invalides");

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
