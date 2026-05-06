import { Request, Response } from "express";
import { createQrCode, validateScannedQr } from "../services/QrCodeService";

export const createQrCodeHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      res.status(400).json({ message: "user_id is required" });
      return;
    }

    const qrCode = await createQrCode({ user_id });

    res.status(201).json({
      message: "QR Code successfully created",
      qr_code: qrCode,
    });
  } catch (error: unknown) {
    const typedError = error as Error;
    res.status(500).json({
      message: "Error generating QR code",
      error: typedError.message,
    });
  }
};

export const validateQrCodeHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { qr_data } = req.body;

    if (!qr_data || typeof qr_data !== "string") {
      res.status(400).json({
        message: "qr_data is required and must be a string",
      });
      return;
    }

    const result = await validateScannedQr(qr_data);

    if (!result.allowed) {
      res.status(403).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error: unknown) {
    const typedError = error as Error;
    res.status(500).json({
      message: "Error validating QR code",
      error: typedError.message,
    });
  }
};
