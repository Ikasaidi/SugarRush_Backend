import { Request, Response, NextFunction } from "express";

const mockGetAllSchedules = jest.fn();
const mockGetSchedulesByTrain = jest.fn();
const mockGetSchedulesByStation = jest.fn();
const mockGetUpcomingSchedules = jest.fn();
const mockGetUpcomingSchedulesByStation = jest.fn();

jest.mock("../../src/services/TrainScedulesService", () => ({
  TrainSchedulesService: jest.fn().mockImplementation(() => ({
    getAllSchedules: mockGetAllSchedules,
    getSchedulesByTrain: mockGetSchedulesByTrain,
    getSchedulesByStation: mockGetSchedulesByStation,
    getUpcomingSchedules: mockGetUpcomingSchedules,
    getUpcomingSchedulesByStation: mockGetUpcomingSchedulesByStation,
  })),
}));

import { TrainSchedulesController } from "../../src/controllers/TrainSchedulesController";

describe("TrainSchedulesController", () => {
  let controller: TrainSchedulesController;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    controller = new TrainSchedulesController();

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("doit retourner tous les horaires", async () => {
    const schedules = [{ train_id: "train-1" }];

    mockGetAllSchedules.mockResolvedValue(schedules);

    await controller.getAllSchedules(
      {} as Request,
      res as Response,
      next as NextFunction
    );

    expect(mockGetAllSchedules).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(schedules);
  });

  it("doit retourner les horaires par train", async () => {
    const schedules = [{ train_id: "train-1" }];

    mockGetSchedulesByTrain.mockResolvedValue(schedules);

    const req = {
      params: {
        trainId: "train-1",
      },
    } as any;

    await controller.getSchedulesByTrain(
      req,
      res as Response,
      next as NextFunction
    );

    expect(mockGetSchedulesByTrain).toHaveBeenCalledWith("train-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(schedules);
  });

  it("doit retourner les horaires par station", async () => {
    const schedules = [{ departure_station: "Station A" }];

    mockGetSchedulesByStation.mockResolvedValue(schedules);

    const req = {
      params: {
        station: "Station A",
      },
    } as any;

    await controller.getSchedulesByStation(
      req,
      res as Response,
      next as NextFunction
    );

    expect(mockGetSchedulesByStation).toHaveBeenCalledWith("Station A");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(schedules);
  });

  it("doit retourner les prochains horaires", async () => {
    const schedules = [{ train_id: "train-1" }];

    mockGetUpcomingSchedules.mockResolvedValue(schedules);

    await controller.getUpcomingSchedules(
      {} as Request,
      res as Response,
      next as NextFunction
    );

    expect(mockGetUpcomingSchedules).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(schedules);
  });

  it("doit retourner les prochains horaires par station", async () => {
    const schedules = [{ station: "Station A" }];

    mockGetUpcomingSchedulesByStation.mockResolvedValue(schedules);

    const req = {
      params: {
        station: "Station A",
      },
    } as any;

    await controller.getUpcomingSchedulesByStation(
      req,
      res as Response,
      next as NextFunction
    );

    expect(mockGetUpcomingSchedulesByStation).toHaveBeenCalledWith("Station A");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(schedules);
  });

  it("doit appeler next si une erreur se produit", async () => {
    const error = new Error("Database error");

    mockGetAllSchedules.mockRejectedValue(error);

    await controller.getAllSchedules(
      {} as Request,
      res as Response,
      next as NextFunction
    );

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });
});