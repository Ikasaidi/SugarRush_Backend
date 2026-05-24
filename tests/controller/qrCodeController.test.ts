import { Request, Response } from "express";
import {
  createQrCodeHandler,
  validateQrCodeHandler,
} from "../../src/controllers/QrCodeController";
import {
  createQrCode,
  validateScannedQr,
} from "../../src/services/QrCodeService";

jest.mock("../../src/services/QrCodeService", () => ({
  createQrCode: jest.fn(),
  validateScannedQr: jest.fn(),
}));

const mockedCreateQrCode = createQrCode as jest.Mock;
const mockedValidateScannedQr = validateScannedQr as jest.Mock;

describe("QrCodeController", () => {
  let res: Pick<Response, "status" | "json">;

  beforeEach(() => {
    // Chaque test repart avec une réponse Express factice propre.
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("doit retourner 400 quand user_id est absent", async () => {
    // Préparation : on simule une requête sans identifiant utilisateur.
    const req = { body: {} } as Request;

    // Action : on appelle le handler de création de QR code.
    await createQrCodeHandler(req, res as Response);

    // Vérification : la validation s'arrête avant l'appel au service.
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "user_id is required" });
    expect(mockedCreateQrCode).not.toHaveBeenCalled();
  });

  it("doit créer un QR code et retourner 201", async () => {
    // Préparation : le service renvoie un QR code prêt à être affiché côté client.
    const qrCode = {
      qr_url: "data:image/png;base64,test",
      qr_payload: "payload",
    };
    mockedCreateQrCode.mockResolvedValue(qrCode);

    const req = { body: { user_id: "user-1" } } as Request;

    // Action : le handler traite une requête valide.
    await createQrCodeHandler(req, res as Response);

    // Vérification : la création est confirmée avec le QR code généré.
    expect(mockedCreateQrCode).toHaveBeenCalledWith({ user_id: "user-1" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "QR Code successfully created",
      qr_code: qrCode,
    });
  });

  it("doit retourner 400 quand qr_data est manquant ou invalide", async () => {
    // Préparation : le champ attendu existe mais n'a pas le bon type.
    const req = { body: { qr_data: 123 } } as Request;

    // Action : on lance la validation du QR code scanné.
    await validateQrCodeHandler(req, res as Response);

    // Vérification : le service n'est pas appelé et la requête est rejetée.
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "qr_data is required and must be a string",
    });
    expect(mockedValidateScannedQr).not.toHaveBeenCalled();
  });

  it("doit retourner 403 quand la validation est refusée", async () => {
    // Préparation : le service signale que l'accès doit être refusé.
    const validationResult = {
      allowed: false,
      message: "Not enough tickets",
    };
    mockedValidateScannedQr.mockResolvedValue(validationResult);

    const req = { body: { qr_data: "{}" } } as Request;

    // Action : on transmet un QR code valide mais sans accès suffisant.
    await validateQrCodeHandler(req, res as Response);

    // Vérification : le contrôleur relaie le refus avec le bon statut.
    expect(mockedValidateScannedQr).toHaveBeenCalledWith("{}");
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(validationResult);
  });

  it("doit retourner 200 quand la validation est acceptée", async () => {
    // Préparation : le service confirme que l'accès est autorisé.
    const validationResult = {
      allowed: true,
      message: "Access granted",
      usedTicketType: "free",
    };
    mockedValidateScannedQr.mockResolvedValue(validationResult);

    const req = { body: { qr_data: "{}" } } as Request;

    // Action : on valide un QR code conforme.
    await validateQrCodeHandler(req, res as Response);

    // Vérification : la réponse renvoie le résultat d'autorisation.
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(validationResult);
  });
});