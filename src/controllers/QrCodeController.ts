import { Request, Response } from 'express';
import { createQrCode } from '../services/QrCodeService';

export const createQrCodeHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, is_valid } = req.body;

    if (!user_id || typeof is_valid !== 'boolean') {
      res.status(400).json({ message: 'Invalid input parameters' });
      return;
    }

    const qrCode = await createQrCode({ user_id, is_valid });

    res.status(201).json({
      message: 'QR Code successfully created',
      qr_code: qrCode,
    });
  } catch (error: unknown) { 
    const typedError = error as Error;

    res.status(500).json({
      message: 'Error generating QR code',
      error: typedError.message, 
    });
  }
};
