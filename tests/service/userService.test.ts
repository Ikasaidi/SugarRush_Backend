import { UserService } from "../../src/services/UserService";
import { UserModel } from "../../src/models/UsersModel";
import { HttpException } from "../../src/utils/http-exception";

jest.mock("../../src/models/UsersModel", () => ({
  UserModel: {
    findById: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
  });

  it("doit retourner un utilisateur par id sans password", async () => {
    const user = {
      _id: "user-1",
      email: "test@test.com",
      username: "test",
      password: "secret",
      user_type: "student",
    };

    (UserModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(user),
    });

    const result = await service.getById("user-1");

    expect(UserModel.findById).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({
      id: "user-1",
      _id: "user-1",
      email: "test@test.com",
      username: "test",
      user_type: "student",
    });
    expect(result).not.toHaveProperty("password");
  });

  it("doit throw si user introuvable", async () => {
    (UserModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(service.getById("bad-id")).rejects.toThrow(HttpException);
  });

  it("doit retourner tous les users non-admin sans password", async () => {
    const users = [
      {
        _id: "user-1",
        email: "a@test.com",
        username: "a",
        password: "secret",
        user_type: "student",
      },
    ];

    (UserModel.find as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(users),
    });

    const result = await service.getAllNonAdminUsers();

    expect(UserModel.find).toHaveBeenCalledWith({
      user_type: { $ne: "admin" },
    });

    expect(result[0]).not.toHaveProperty("password");
    expect(result[0].id).toBe("user-1");
  });

  it("doit modifier un utilisateur", async () => {
    const user = {
      _id: "user-1",
      email: "old@test.com",
      username: "old",
      user_type: "student",
      fname: "Old",
      lname: "Name",
      phone: "111",
      address: "old address",
      save: jest.fn().mockResolvedValue(true),
    };

    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });

    (UserModel.findOne as jest.Mock).mockResolvedValue(null);

    const result = await service.updateUser("user-1", {
      email: " NEW@TEST.COM ",
      username: " newUser ",
      fname: " New ",
    });

    expect(user.email).toBe("new@test.com");
    expect(user.username).toBe("newUser");
    expect(user.fname).toBe("New");
    expect(user.save).toHaveBeenCalled();

    expect(result.email).toBe("new@test.com");
    expect(result.username).toBe("newUser");
  });

  it("doit throw si email existe déjà", async () => {
    const user = {
      _id: "user-1",
      email: "old@test.com",
      username: "old",
      save: jest.fn(),
    };

    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });

    (UserModel.findOne as jest.Mock).mockResolvedValue({
      _id: "user-2",
      email: "new@test.com",
    });

    await expect(
      service.updateUser("user-1", {
        email: "new@test.com",
      })
    ).rejects.toThrow(HttpException);

    expect(user.save).not.toHaveBeenCalled();
  });

  it("doit supprimer un utilisateur", async () => {
    (UserModel.findByIdAndDelete as jest.Mock).mockResolvedValue({
      _id: "user-1",
    });

    const result = await service.deleteUser("user-1");

    expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ success: true });
  });

  it("doit promouvoir un utilisateur en admin", async () => {
    (UserModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "user-1",
        email: "test@test.com",
        username: "test",
        user_type: "student",
      }),
    });

    (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "user-1",
        email: "test@test.com",
        username: "test",
        user_type: "admin",
      }),
    });

    const result = await service.promoteToAdmin("user-1");

    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "user-1",
      { $set: { user_type: "admin" } },
      { new: true }
    );

    expect(result.user_type).toBe("admin");
  });
});