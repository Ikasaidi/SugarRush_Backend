import QRCode from "qrcode";
import { createQrCode, validateScannedQr } from "../../src/services/QrCodeService";
import { QrCodeModel } from "../../src/models/QrCodeModel";
import { UserModel } from "../../src/models/UsersModel";
import { WalletModel } from "../../src/models/WalletModel";

const mockToDataURL = QRCode.toDataURL as jest.Mock;
const mockFindById = UserModel.findById as jest.Mock;
const mockFindOne = WalletModel.findOne as jest.Mock;
const mockQrCodeConstructor = QrCodeModel as unknown as jest.Mock;

jest.mock("qrcode", () => ({
  __esModule: true,
  default: {
    toDataURL: jest.fn(),
  },
}));

jest.mock("../../src/models/QrCodeModel", () => ({
  QrCodeModel: jest.fn(),
}));

jest.mock("../../src/models/UsersModel", () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

jest.mock("../../src/models/WalletModel", () => ({
  WalletModel: {
    findOne: jest.fn(),
  },
}));

describe("QrCodeService", () => {
  beforeEach(() => {
    // Les mocks externes sont remis à zéro avant chaque scénario.
    jest.clearAllMocks();
  });

  it("doit créer et enregistrer un QR code pour un utilisateur existant", async () => {
    // Préparation : on simule un utilisateur présent en base et une génération QR fonctionnelle.
    const user = {
      _id: { toString: () => "user-1" },
      email: "user@example.com",
      username: "user1",
    };
    const savedQrCode = {
      _id: "qr-1",
      user_id: user._id,
      is_valid: true,
      qr_url: "data:image/png;base64,test",
      qr_payload: '{"user_id":"user-1"}',
      save: jest.fn(),
    };

    mockFindById.mockResolvedValue(user);
    mockToDataURL.mockResolvedValue("data:image/png;base64,test");
    mockQrCodeConstructor.mockImplementation(() => ({
      ...savedQrCode,
      save: jest.fn().mockResolvedValue(savedQrCode),
    }));

    const result = await createQrCode({ user_id: "user-1" });

    expect(mockFindById).toHaveBeenCalledWith("user-1");
    expect(mockToDataURL).toHaveBeenCalledWith(expect.stringContaining("user-1"));
    expect(mockQrCodeConstructor).toHaveBeenCalledWith({
      user_id: user._id,
      is_valid: true,
      qr_url: "data:image/png;base64,test",
      qr_payload: expect.stringContaining("user-1"),
      created_at: expect.any(Date),
    });
    expect(result).toBeDefined();
  });

  it("doit lever une erreur si l'utilisateur n'existe pas", async () => {
    // Préparation : aucun utilisateur ne correspond à l'identifiant fourni.
    mockFindById.mockResolvedValue(null);

    await expect(createQrCode({ user_id: "missing-user" })).rejects.toThrow(
      "This user has not been found",
    );
  });

  it("doit valider un QR code et retirer un ticket gratuit", async () => {
    const user = {
      _id: { toString: () => "user-1" },
      email: "user@example.com",
      username: "user1",
    };
    const walletSave = jest.fn().mockResolvedValue(true);
    const wallet = {
      free_ticket_balance: 2,
      paid_ticket_balance: 1,
      updated_at: new Date(),
      save: walletSave,
    };

    mockFindById.mockResolvedValue(user);
    mockFindOne.mockResolvedValue(wallet);

    const result = await validateScannedQr(
      JSON.stringify({ user_id: "user-1", type: "train_access", issued_at: new Date().toISOString() }),
    );

    expect(mockFindById).toHaveBeenCalledWith("user-1");
    expect(mockFindOne).toHaveBeenCalledWith({ user_id: user._id });
    expect(walletSave).toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({
        allowed: true,
        message: "Access granted",
        usedTicketType: "free",
        remaining_free_tickets: 1,
        remaining_paid_tickets: 1,
      }),
    );
  });

  it("doit refuser l'accès quand le wallet est absent", async () => {
    const user = {
      _id: { toString: () => "user-1" },
      email: "user@example.com",
      username: "user1",
    };

    mockFindById.mockResolvedValue(user);
    mockFindOne.mockResolvedValue(null);

    const result = await validateScannedQr(
      JSON.stringify({ user_id: "user-1", type: "train_access", issued_at: new Date().toISOString() }),
    );

    expect(result).toEqual({
      allowed: false,
      message: "QR scanned successfully, but wallet not found",
    });
  });

  it("doit lever une erreur quand le format QR est invalide", async () => {
    // Préparation : la donnée n'est pas un JSON valide.
    // Vérification : le service doit rejeter ce format immédiatement.
    await expect(validateScannedQr("not-json")).rejects.toThrow(
      "Invalid QR format",
    );
  });
});
