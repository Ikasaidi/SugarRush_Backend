import QRCode from 'qrcode';
import { QrCodeModel } from '../models/QrCodeModel';
import { Types } from 'mongoose';
import { IQrCode } from '../interfaces/IQRCode';
import { UserModel } from '../models/UsersModel';

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

  const user = await UserModel.findById(user_id)

  if (!user) {
    throw new Error("This user has not been found")
  }

  let freeTickets = 0;

  //Détéermination des billet gratuit en fonction du type d'utilisateur
  if (user.user_type === 'student'){
    freeTickets = 2;
  }
  else if (user.user_type === 'senior'){
    freeTickets = 4
  } else if(user.user_type === 'adult'){
    freeTickets = 0;
  }

  const qrData = {
    user_id: user_id.toString(),
    is_valid,
    freeTickets,
    user_type: user.user_type
  }

  const qrUrl = await generateQRCode(JSON.stringify(qrData));

  const newQrCode = new QrCodeModel({
    user_id,
    is_valid,
    qr_url: qrUrl,
    created_at: new Date(),
  });

  await newQrCode.save();
  return newQrCode;
};
