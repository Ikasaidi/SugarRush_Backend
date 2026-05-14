import { UserModel } from "../models/UsersModel";
import { HttpException } from "../utils/http-exception";

export class UserService {

  // =====================================================
  // GET USER BY ID
  // =====================================================

  async getById(userId: string) {

    const user =
      await UserModel.findById(userId).lean();

    if (!user) {
      throw new HttpException(
        404,
        "Utilisateur introuvable"
      );
    }

    const {
      password,
      ...safeUser
    } = user as any;

    return {
      id: user._id,
      ...safeUser,
    };
  }

  // =====================================================
  // GET ALL NON-ADMIN USERS
  // =====================================================

  async getAllNonAdminUsers() {

    const users =
      await UserModel.find({
        user_type: { $ne: "admin" }
      }).lean();

    const safeUsers = users.map((user: any) => {
      const { password, ...safeUser } = user;
      return {
        id: user._id,
        ...safeUser,
      };
    });

    return safeUsers;
  }

  // =====================================================
  // UPDATE USER
  // =====================================================

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
    }
  ) {

    const user =
      await UserModel.findById(userId)
        .select("+password");

    if (!user) {
      throw new HttpException(
        404,
        "Utilisateur introuvable"
      );
    }

    // =================================================
    // EMAIL CHECK
    // =================================================

    if (data.email?.trim()) {

      const cleanEmail =
        data.email.trim().toLowerCase();

      const existingEmail =
        await UserModel.findOne({
          email: cleanEmail,
          _id: { $ne: userId },
        });

      if (existingEmail) {
        throw new HttpException(
          409,
          "Cet email est déjà utilisé"
        );
      }

      user.email = cleanEmail;
    }

    // =================================================
    // USERNAME CHECK
    // =================================================

    if (data.username?.trim()) {

      const cleanUsername =
        data.username.trim();

      const existingUsername =
        await UserModel.findOne({
          username: cleanUsername,
          _id: { $ne: userId },
        });

      if (existingUsername) {
        throw new HttpException(
          409,
          "Ce username est déjà utilisé"
        );
      }

      user.username = cleanUsername;
    }

    // =================================================
    // OTHER FIELDS
    // =================================================

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

    // =================================================
    // PASSWORD
    // =================================================

    if (data.password?.trim()) {
      user.password =
        data.password.trim();
    }

    await user.save();

    return {
      id: user._id,

      email: user.email,
      username: user.username,
      user_type: user.user_type,

      fname: user.fname,
      lname: user.lname,
      phone: user.phone,
      address: user.address,
    };
  }

  // =====================================================
  // DELETE USER
  // =====================================================

  async deleteUser(userId: string) {

    const user =
      await UserModel.findByIdAndDelete(userId);

    if (!user) {
      throw new HttpException(
        404,
        "Utilisateur introuvable"
      );
    }

    return {
      success: true,
    };
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async logout() {

    return {
      success: true,
    };
  }

  // =====================================================
  // PROMOTE USER TO ADMIN
  // =====================================================

  async promoteToAdmin(userId: string) {

    const user =
      await UserModel.findById(userId);

    if (!user) {
      throw new HttpException(
        404,
        "Utilisateur introuvable"
      );
    }

    if (user.user_type === "admin") {
      throw new HttpException(
        409,
        "Cet utilisateur est déjà un admin"
      );
    }

    user.user_type = "admin";
    await user.save();

    return {
      id: user._id,
      email: user.email,
      username: user.username,
      user_type: user.user_type,
      fname: user.fname,
      lname: user.lname,
      phone: user.phone,
      address: user.address,
      message: "Utilisateur promu en admin avec succès",
    };
  }
}