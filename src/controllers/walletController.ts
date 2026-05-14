import { Request, Response, NextFunction } from "express";
import { WalletModel } from "../models/WalletModel";
import { PurchasesModel } from "../models/PurchasesModel";

export class WalletController {
  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(400).json({ success: false, message: "Missing user id" });
      }

      // find or create wallet
      let wallet = await WalletModel.findOne({ user_id: userId }).lean();

      if (!wallet) {
        const created = await WalletModel.create({ user_id: userId });
        wallet = created.toObject ? created.toObject() : created;
      }

      // purchase history
      const purchases = await PurchasesModel.find({ user_id: userId }).sort({ created_at: -1 }).lean();

      // stats
      const total_spent = purchases.reduce((sum: number, p: any) => sum + (Number(p.total_amount) || 0), 0);

      return res.status(200).json({ success: true, wallet, purchases, stats: { total_spent } });
    } catch (err) {
      next(err);
    }
  };
}

export default new WalletController();
