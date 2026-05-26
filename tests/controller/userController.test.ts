import { Request, Response, NextFunction } from "express";

const mockGetById = jest.fn();
const mockGetAllNonAdminUsers = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockPromoteToAdmin = jest.fn();

jest.mock("../../src/services/UserService", () => ({
  UserService: jest.fn().mockImplementation(() => ({
    getById: mockGetById,
    getAllNonAdminUsers: mockGetAllNonAdminUsers,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser,
    promoteToAdmin: mockPromoteToAdmin,
  })),
}));

import { UserController } from "../../src/controllers/userController";

describe("UserController", () => {
  let controller: UserController;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new UserController();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("me doit retourner l'utilisateur connecté", async () => {
    const user = { id: "user-1", email: "test@test.com" };

    mockGetById.mockResolvedValue(user);

    const req = {
      user: { id: "user-1" },
    } as any;

    await controller.me(req, res as Response, next as NextFunction);

    expect(mockGetById).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user,
    });
  });

  it("getAllNonAdminUsers doit retourner les users non-admin", async () => {
    const users = [{ id: "user-1" }, { id: "user-2" }];

    mockGetAllNonAdminUsers.mockResolvedValue(users);

    await controller.getAllNonAdminUsers(
      {} as Request,
      res as Response,
      next as NextFunction
    );

    expect(mockGetAllNonAdminUsers).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      users,
    });
  });

  it("updateMe doit modifier seulement les champs autorisés", async () => {
    const updatedUser = {
      id: "user-1",
      email: "new@test.com",
      username: "new",
    };

    mockUpdateUser.mockResolvedValue(updatedUser);

    const req = {
      user: { id: "user-1" },
      body: {
        email: "new@test.com",
        username: "new",
        role: "admin",
      },
    } as any;

    await controller.updateMe(req, res as Response, next as NextFunction);

    expect(mockUpdateUser).toHaveBeenCalledWith("user-1", {
      username: "new",
      email: "new@test.com",
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: updatedUser,
    });
  });

  it("deleteMe doit supprimer le compte connecté", async () => {
    mockDeleteUser.mockResolvedValue({ success: true });

    const req = {
      user: { id: "user-1" },
    } as any;

    await controller.deleteMe(req, res as Response, next as NextFunction);

    expect(mockDeleteUser).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Compte supprimé",
    });
  });

  it("deleteUserById doit supprimer un utilisateur par id", async () => {
    mockDeleteUser.mockResolvedValue({ success: true });

    const req = {
      params: { targetUserId: "user-2" },
    } as any;

    await controller.deleteUserById(req, res as Response, next as NextFunction);

    expect(mockDeleteUser).toHaveBeenCalledWith("user-2");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Utilisateur supprimé",
    });
  });

  it("deleteUserById doit appeler next si targetUserId est absent", async () => {
    const req = {
      params: {},
    } as any;

    await controller.deleteUserById(req, res as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  it("logout doit retourner 200", async () => {
    await controller.logout(
      {} as Request,
      res as Response,
      next as NextFunction
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Déconnecté",
    });
  });

  it("promoteToAdmin doit promouvoir un utilisateur", async () => {
    const promotedUser = {
      id: "user-2",
      user_type: "admin",
    };

    mockPromoteToAdmin.mockResolvedValue(promotedUser);

    const req = {
      body: { targetUserId: "user-2" },
    } as any;

    await controller.promoteToAdmin(req, res as Response, next as NextFunction);

    expect(mockPromoteToAdmin).toHaveBeenCalledWith("user-2");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      user: promotedUser,
    });
  });
});