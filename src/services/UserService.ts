import { UserModel} from "../models/UsersModel";
import { HttpException } from "../utils/http-exception";

// ===========================================================
// USER SERVICE
// - Encapsule la logique métier pour l'utilisateur courant
// - getById, updateUser, deleteUser, logout (stateless JWT)
// ===========================================================
export class UserService {
  // ---------------------------------------------------------
  // Récupère un utilisateur par son id et masque le password
  // ---------------------------------------------------------
  async getById(userId: string) {
    const user = await UserModel.findById(userId).lean();
    if (!user) throw new HttpException(404, "Utilisateur introuvable");

    const { password, ...safe } = user as any;
    return { id: user._id, ...safe };
  }

  // ---------------------------------------------------------
  // Met à jour quelques champs autorisés. Le middleware Mongoose
  // re-hash le password si modifié (pre('save')).
  // ---------------------------------------------------------
  async updateUser(
    userId: string,
    data: {
      username?: string;
      fname?: string;
      lname?: string;
      phone?: string;
      address?: string;
      password?: string;
    }
  ) {
    if (!data || Object.keys(data).length === 0) {
      throw new HttpException(400, "Aucun champ à mettre à jour");
    }

    const user = await UserModel.findById(userId);
    if (!user) throw new HttpException(404, "Utilisateur introuvable");

    if (data.username) user.username = data.username;
    if (data.fname) user.fname = data.fname;
    if (data.lname) user.lname = data.lname;
    if (data.phone) user.phone = data.phone;
    if (data.address) user.address = data.address;

    if (data.password) user.password = data.password;

    await user.save();

    return {
      id: user._id,
      email: user.email,
      username: user.username,
      fname: user.fname,
      lname: user.lname,
      phone: user.phone,
      address: user.address,
    };
  }

  // ---------------------------------------------------------
  // Supprime l'utilisateur par id
  // ---------------------------------------------------------
  async deleteUser(userId: string) {
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) throw new HttpException(404, "Utilisateur introuvable");
    return { success: true };
  }

  // ---------------------------------------------------------
  // Logout (stateless JWT): rien à invalider coté serveur
  // ---------------------------------------------------------
  async logout() {
    // Stateless JWT: côté serveur, rien à faire (sauf si blacklist, non implémentée)
    return { success: true };
  }
}
