import QRCode from "qrcode";
import { QrCodeModel } from "../models/QrCodeModel";
import { Types } from "mongoose";
import { IQrCode } from "../interfaces/IQRCode";
import { UserModel } from "../models/UsersModel";
import { WalletModel } from "../models/WalletModel";

interface ICreateQrCodeInput {
  user_id: Types.ObjectId | string;
}

interface IValidateQrCodeResult {
  allowed: boolean;
  message: string;
  usedTicketType?: "free" | "paid";
  remaining_free_tickets?: number;
  remaining_paid_tickets?: number;
}

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrUrl = await QRCode.toDataURL(data);
    return qrUrl;
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
};

export const createQrCode = async (
  input: ICreateQrCodeInput,
): Promise<IQrCode> => {
  const { user_id } = input;

  const user = await UserModel.findById(user_id);
  if (!user) {
    throw new Error("This user has not been found");
  }

  const qrPayload = {
    user_id: user._id.toString(),
    type: "train_access",
    issued_at: new Date().toISOString(),
  };

  const qrPayloadString = JSON.stringify(qrPayload);
  const qrUrl = await generateQRCode(qrPayloadString);

  const newQrCode = new QrCodeModel({
    user_id: user._id,
    is_valid: true,
    qr_url: qrUrl,
    qr_payload: qrPayloadString,
    created_at: new Date(),
  });

  await newQrCode.save();
  return newQrCode;
};

export const validateScannedQr = async (
  qrRawData: string,
): Promise<IValidateQrCodeResult> => {
  let parsed: any;

  try {
    parsed = JSON.parse(qrRawData);
  } catch (error) {
    throw new Error("Invalid QR format");
  }

  const { user_id, type } = parsed;

  if (!user_id || type !== "train_access") {
    throw new Error("Invalid QR content");
  }

  const user = await UserModel.findById(user_id);
  if (!user) {
    throw new Error("User not found");
  }

  const wallet = await WalletModel.findOne({ user_id: user._id });
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  let usedTicketType: "free" | "paid" | undefined;

  if (wallet.free_ticket_balance > 0) {
    wallet.free_ticket_balance -= 1;
    usedTicketType = "free";
  } else if (wallet.paid_ticket_balance > 0) {
    wallet.paid_ticket_balance -= 1;
    usedTicketType = "paid";
  } else {
    return {
      allowed: false,
      message: "Not enough tickets",
      remaining_free_tickets: wallet.free_ticket_balance,
      remaining_paid_tickets: wallet.paid_ticket_balance,
    };
  }

  wallet.updated_at = new Date();
  await wallet.save();

  return {
    allowed: true,
    message: "Access granted",
    usedTicketType,
    remaining_free_tickets: wallet.free_ticket_balance,
    remaining_paid_tickets: wallet.paid_ticket_balance,
  };
};
