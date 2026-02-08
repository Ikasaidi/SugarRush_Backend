import { Schema } from "mongoose";
import { IUsers } from "../interfaces/IUsers";
import { hashPassword } from "../utils/bcryptHelp";

// ===========================================================
// USER HASH PASSWORD MIDDLEWARE (Mongoose)
// - Hash le mot de passe avant sauvegarde en base
// - Ne hash QUE si le champ "password" a changé
// ===========================================================

export const hashPasswordMiddleware = (schema: Schema<IUsers>) => {
  schema.pre("save", async function () {
    const user = this as any;
   
     // On ne re-hash pas si le password n’a pas été modifié
    if (!user.isModified("password")) return;

      // Hash du mot de passe en utilisant bcrypt
      user.password = await hashPassword(user.password);
  });
};
