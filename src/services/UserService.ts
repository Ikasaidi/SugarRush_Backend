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
    email?: string;
    password?: string;
    user_type?: string;
  }
) {

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new HttpException(
      404,
      "Utilisateur introuvable"
    );
  }

  // =====================================================
  // UPDATE FIELDS
  // =====================================================

  if (data.username?.trim()) {
    user.username = data.username.trim();
  }

  if (data.fname?.trim()) {
    user.fname = data.fname.trim();
  }

  if (data.lname?.trim()) {
    user.lname = data.lname.trim();
  }

  if (data.phone?.trim()) {
    user.phone = data.phone.trim();
  }

  if (data.address?.trim()) {
    user.address = data.address.trim();
  }

  if (data.email?.trim()) {
    user.email =
      data.email.toLowerCase().trim();
  }

  if (data.user_type) {
    user.user_type = data.user_type as any;
  }

  // IMPORTANT
  // pre("save") hash automatiquement
  if (data.password?.trim()) {
    user.password = data.password.trim();
  }

  user.updated_at = new Date();

  await user.save();

  return {
    success: true,

    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      fname: user.fname,
      lname: user.lname,
      phone: user.phone,
      address: user.address,
      user_type: user.user_type,
    },
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
