import QRCode from 'qrcode';
import { QrCodeModel } from '../models/QrCodeModel';
import { Types } from 'mongoose';
import { IQrCode } from '../interfaces/IQRCode';

interface ICreateQrCodeInput {
  user_id: Types.ObjectId;
  is_valid: boolean;
}

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrUrl = await QRCode.toDataURL(data);
    return qrUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

export const createQrCode = async (input: ICreateQrCodeInput): Promise<IQrCode> => {
  const { user_id, is_valid } = input;

  const qrData = `${user_id.toString()}-${is_valid}`; 
  const qrUrl = await generateQRCode(qrData);

  const newQrCode = new QrCodeModel({
    user_id,
    is_valid,
    qr_url: qrUrl,
    created_at: new Date(),
  });

  await newQrCode.save();
  return newQrCode;
};
