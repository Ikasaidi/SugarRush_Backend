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
  remainingFreeTickets?: number;
  remainingPaidTickets?: number;
  wallet?: {
    free_ticket_balance: number;
    paid_ticket_balance: number;
  };
}

function normalizeTicketBalance(value: unknown): number {
  const balance = Number(value);

  return Number.isFinite(balance) && balance > 0 ? balance : 0;
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

  console.log("QR GENERATION REQUEST FOR USER ID:", user_id);

  const user = await UserModel.findById(user_id);
  if (!user) {
    console.log("QR GENERATION FAILED - USER NOT FOUND:", user_id);
    throw new Error("This user has not been found");
  }

  console.log("QR GENERATED FOR USER:", {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
  });

  const qrPayload = {
    user_id: user._id.toString(),
    type: "train_access",
    issued_at: new Date().toISOString(),
  };

  const qrPayloadString = JSON.stringify(qrPayload);

  console.log("QR PAYLOAD CREATED:", qrPayloadString);

  const qrUrl = await generateQRCode(qrPayloadString);

  const newQrCode = new QrCodeModel({
    user_id: user._id,
    is_valid: true,
    qr_url: qrUrl,
    qr_payload: qrPayloadString,
    created_at: new Date(),
  });

  await newQrCode.save();

  console.log("QR SAVED IN DATABASE:", {
    qr_id: newQrCode._id,
    user_id: user._id.toString(),
  });

  return newQrCode;
};

export const validateScannedQr = async (
  qrRawData: string,
): Promise<IValidateQrCodeResult> => {
  console.log("QR SCANNED RAW DATA:", qrRawData);

  let parsed: any;

  try {
    parsed = JSON.parse(qrRawData);
    console.log("QR PARSED DATA:", parsed);
  } catch (error) {
    console.log("QR SCAN FAILED - INVALID JSON:", qrRawData);
    throw new Error("Invalid QR format");
  }

  const { user_id, type, issued_at } = parsed;

  console.log("QR SCAN INFO:", {
    user_id,
    type,
    issued_at,
  });

  if (!user_id || type !== "train_access") {
    console.log("QR SCAN FAILED - INVALID CONTENT:", parsed);
    throw new Error("Invalid QR content");
  }

  const user = await UserModel.findById(user_id);

  if (!user) {
    console.log("QR SCANNED BUT USER NOT FOUND:", user_id);
    throw new Error("User not found");
  }

  console.log("QR SCANNED USER FOUND:", {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
  });

  const wallet = await WalletModel.findOne({ user_id: user._id });

  if (!wallet) {
    console.log("QR SCAN OK - BUT WALLET NOT FOUND FOR USER:", {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    return {
      allowed: false,
      message: "QR scanned successfully, but wallet not found",
    };
  }

  console.log("WALLET FOUND FOR SCANNED QR:", {
    user_id: user._id.toString(),
    free_ticket_balance: wallet.free_ticket_balance,
    paid_ticket_balance: wallet.paid_ticket_balance,
  });

  wallet.free_ticket_balance = normalizeTicketBalance(wallet.free_ticket_balance);
  wallet.paid_ticket_balance = normalizeTicketBalance(wallet.paid_ticket_balance);

  let usedTicketType: "free" | "paid" | undefined;

  if (wallet.free_ticket_balance > 0) {
    wallet.free_ticket_balance -= 1;
    usedTicketType = "free";
  } else if (wallet.paid_ticket_balance > 0) {
    wallet.paid_ticket_balance -= 1;
    usedTicketType = "paid";
  } else {
    console.log("QR SCAN OK - USER HAS NO TICKETS:", {
      user_id: user._id.toString(),
      email: user.email,
      username: user.username,
      free_ticket_balance: wallet.free_ticket_balance,
      paid_ticket_balance: wallet.paid_ticket_balance,
    });

    return {
      allowed: false,
      message: "Not enough tickets",
      remaining_free_tickets: wallet.free_ticket_balance,
      remaining_paid_tickets: wallet.paid_ticket_balance,
      remainingFreeTickets: wallet.free_ticket_balance,
      remainingPaidTickets: wallet.paid_ticket_balance,
      wallet: {
        free_ticket_balance: wallet.free_ticket_balance,
        paid_ticket_balance: wallet.paid_ticket_balance,
      },
    };
  }

  wallet.updated_at = new Date();
  await wallet.save();

  console.log("QR ACCESS GRANTED:", {
    user_id: user._id.toString(),
    email: user.email,
    username: user.username,
    usedTicketType,
    remaining_free_tickets: wallet.free_ticket_balance,
    remaining_paid_tickets: wallet.paid_ticket_balance,
  });

  return {
    allowed: true,
    message: "Access granted",
    usedTicketType,
    remaining_free_tickets: wallet.free_ticket_balance,
    remaining_paid_tickets: wallet.paid_ticket_balance,
    remainingFreeTickets: wallet.free_ticket_balance,
    remainingPaidTickets: wallet.paid_ticket_balance,
    wallet: {
      free_ticket_balance: wallet.free_ticket_balance,
      paid_ticket_balance: wallet.paid_ticket_balance,
    },
  };
};