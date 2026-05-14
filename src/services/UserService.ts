import { UserModel } from "../models/UsersModel";
import { HttpException } from "../utils/http-exception";
import { WalletModel } from "../models/WalletModel";
import { PurchasesModel } from "../models/PurchasesModel";

export class UserService {
  // =====================================================
  // GET USER BY ID
  // =====================================================

  async getById(userId: string) {
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      throw new HttpException(404, "Utilisateur introuvable");
    }

    // =========================================
    // WALLET
    // =========================================

    const wallet = await WalletModel.findOne({
      user_id: userId,
    }).lean();

    // =========================================
    // PURCHASE HISTORY
    // =========================================

    const purchases = await PurchasesModel.find({
      user_id: userId,
      status: "completed",
    })
      .sort({ created_at: -1 })
      .lean();

    // =========================================
    // TOTAL SPENT
    // =========================================

    const totalSpent = purchases.reduce(
      (acc, purchase) => acc + purchase.total_amount,
      0,
    );

    const { password, ...safeUser } = user as any;

    return {
      id: user._id,

      ...safeUser,

      wallet: {
        free_ticket_balance: wallet?.free_ticket_balance || 0,

        paid_ticket_balance: wallet?.paid_ticket_balance || 0,
      },

      stats: {
        total_spent: totalSpent,
      },

      purchases,
    };
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
    },
  ) {
    const user = await UserModel.findById(userId).select("+password");

    if (!user) {
      throw new HttpException(404, "Utilisateur introuvable");
    }

    // =================================================
    // EMAIL CHECK
    // =================================================

    if (data.email?.trim()) {
      const cleanEmail = data.email.trim().toLowerCase();

      const existingEmail = await UserModel.findOne({
        email: cleanEmail,
        _id: { $ne: userId },
      });

      if (existingEmail) {
        throw new HttpException(409, "Cet email est déjà utilisé");
      }

      user.email = cleanEmail;
    }

    // =================================================
    // USERNAME CHECK
    // =================================================

    if (data.username?.trim()) {
      const cleanUsername = data.username.trim();

      const existingUsername = await UserModel.findOne({
        username: cleanUsername,
        _id: { $ne: userId },
      });

      if (existingUsername) {
        throw new HttpException(409, "Ce username est déjà utilisé");
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
      user.password = data.password.trim();
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
    const user = await UserModel.findByIdAndDelete(userId);

    if (!user) {
      throw new HttpException(404, "Utilisateur introuvable");
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
}
