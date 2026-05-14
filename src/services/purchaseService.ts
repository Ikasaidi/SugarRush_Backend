import { Types } from "mongoose";
import { PurchasesModel } from "../models/PurchasesModel";
import { WalletModel } from "../models/WalletModel";
import { HttpException } from "../utils/http-exception";

export class PurchaseService {
  async purchaseTickets(data: {
    user_id: string;
    quantity: number;
    unit_price: number;
    currency: string;
  }) {
    const { user_id, quantity, unit_price, currency } = data;

    // -----------------------------
    // VALIDATIONS
    // -----------------------------
    if (quantity <= 0) {
      throw new HttpException(400, "Quantity must be greater than 0");
    }

    if (unit_price < 0) {
      throw new HttpException(400, "Unit price cannot be negative");
    }

    // -----------------------------
    // TOTAL
    // -----------------------------
    const total_amount = quantity * unit_price;

    // -----------------------------
    // CREATE PURCHASE
    // -----------------------------
    const purchase = await PurchasesModel.create({
      user_id: new Types.ObjectId(user_id),
      quantity,
      unit_price,
      total_amount,
      currency,
      status: "completed",
    });

    // -----------------------------
    // FIND WALLET
    // -----------------------------
    let wallet = await WalletModel.findOne({
      user_id: new Types.ObjectId(user_id),
    });

    // -----------------------------
    // CREATE WALLET IF NOT EXISTS
    // -----------------------------
    if (!wallet) {
      wallet = await WalletModel.create({
        user_id: new Types.ObjectId(user_id),
        free_ticket_balance: 0,
        paid_ticket_balance: quantity,
      });
    } else {
      // -----------------------------
      // UPDATE PAID TICKETS
      // -----------------------------
      wallet.paid_ticket_balance += quantity;
      wallet.updated_at = new Date();

      await wallet.save();
    }

    return {
      message: "Tickets purchased successfully",
      purchase,
      wallet,
    };
  }

  // ===========================================================
  // GET PURCHASE HISTORY
  // ===========================================================
  async getPurchaseHistory(user_id: string) {
    const purchases = await PurchasesModel.find({
      user_id: new Types.ObjectId(user_id),
    }).sort({ created_at: -1 });

    return purchases;
  }
}


// USER.ID

// import { Types } from "mongoose";
// import { PurchasesModel } from "../models/PurchasesModel";
// import { WalletModel } from "../models/WalletModel";
// import { HttpException } from "../utils/http-exception";

// export class PurchaseService {

//   async purchaseTickets(data: {
//     user_id: string;
//     quantity: number;
//     unit_price: number;
//     currency: string;
//   }) {

//     const { user_id, quantity, unit_price, currency } = data;

//     // -----------------------------
//     // VALIDATIONS
//     // -----------------------------
//     if (quantity <= 0) {
//       throw new HttpException(400, "Quantity must be greater than 0");
//     }

//     if (unit_price < 0) {
//       throw new HttpException(400, "Unit price cannot be negative");
//     }

//     // -----------------------------
//     // TOTAL
//     // -----------------------------
//     const total_amount = quantity * unit_price;

//     // -----------------------------
//     // CREATE PURCHASE
//     // -----------------------------
//     const purchase = await PurchasesModel.create({
//       user_id: new Types.ObjectId(user_id),
//       quantity,
//       unit_price,
//       total_amount,
//       currency,
//       status: "completed",
//     });

//     // -----------------------------
//     // FIND WALLET
//     // -----------------------------
//     let wallet = await WalletModel.findOne({
//       user_id: new Types.ObjectId(user_id),
//     });

//     // -----------------------------
//     // CREATE WALLET IF NOT EXISTS
//     // -----------------------------
//     if (!wallet) {
//       wallet = await WalletModel.create({
//         user_id: new Types.ObjectId(user_id),
//         free_ticket_balance: 0,
//         paid_ticket_balance: quantity,
//       });
//     } else {

//       // -----------------------------
//       // UPDATE PAID TICKETS
//       // -----------------------------
//       wallet.paid_ticket_balance += quantity;
//       wallet.updated_at = new Date();

//       await wallet.save();
//     }

//     return {
//       message: "Tickets purchased successfully",
//       purchase,
//       wallet,
//     };
//   }
// }
