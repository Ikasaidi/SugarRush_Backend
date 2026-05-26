import { TrainSchedulesService } from "../../src/services/TrainScedulesService";
import { TrainSchedulesModel } from "../../src/models/TrainSchedulesModel";

jest.mock("../../src/models/TrainSchedulesModel", () => ({
  TrainSchedulesModel: jest.fn(),
}));

const mockSave = jest.fn();
const mockFind = jest.fn();
const mockSort = jest.fn();
const mockLimit = jest.fn();
const mockDeleteMany = jest.fn();

const mockedTrainSchedulesModel = TrainSchedulesModel as unknown as jest.Mock & {
  find: jest.Mock;
  deleteMany: jest.Mock;
};

describe("TrainSchedulesService", () => {
  let service: TrainSchedulesService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new TrainSchedulesService();

    mockedTrainSchedulesModel.mockImplementation((data) => ({
      ...data,
      save: mockSave,
    }));

    mockedTrainSchedulesModel.find = mockFind;
    mockedTrainSchedulesModel.deleteMany = mockDeleteMany;

    mockSort.mockReturnValue({
      limit: mockLimit,
    });

    mockFind.mockReturnValue({
      sort: mockSort,
    });
  });

  it("doit créer un horaire de train", async () => {
    const data = {
      train_id: "train-1",
      departure_station: "Station A",
      arrival_station: "Station B",
      departure_time: new Date("2026-05-25T10:00:00"),
      arrival_time: new Date("2026-05-25T10:30:00"),
    };

    mockSave.mockResolvedValue(data);

    const result = await service.createSchedule(data);

    expect(mockedTrainSchedulesModel).toHaveBeenCalledWith(data);
    expect(mockSave).toHaveBeenCalled();
    expect(result).toEqual(data);
  });

  it("doit supprimer les horaires futurs d'un train", async () => {
    mockDeleteMany.mockResolvedValue({ deletedCount: 2 });

    const result = await service.deleteFutureSchedules("train-1");

    expect(mockDeleteMany).toHaveBeenCalledWith({
      train_id: "train-1",
      arrival_time: { $gte: expect.any(Date) },
    });

    expect(result).toEqual({ deletedCount: 2 });
  });

  it("doit retourner tous les horaires triés par departure_time décroissant", async () => {
    const schedules = [{ train_id: "train-1" }];
    mockSort.mockResolvedValue(schedules);

    const result = await service.getAllSchedules();

    expect(mockFind).toHaveBeenCalledWith();
    expect(mockSort).toHaveBeenCalledWith({ departure_time: -1 });
    expect(result).toEqual(schedules);
  });

  it("doit retourner les horaires par train", async () => {
    const schedules = [{ train_id: "train-1" }];
    mockSort.mockResolvedValue(schedules);

    const result = await service.getSchedulesByTrain("train-1");

    expect(mockFind).toHaveBeenCalledWith({ train_id: "train-1" });
    expect(mockSort).toHaveBeenCalledWith({ departure_time: -1 });
    expect(result).toEqual(schedules);
  });

  it("doit retourner les horaires par station", async () => {
    const schedules = [{ departure_station: "Station A" }];
    mockSort.mockResolvedValue(schedules);

    const result = await service.getSchedulesByStation("Station A");

    expect(mockFind).toHaveBeenCalledWith({
      $or: [
        { departure_station: "Station A" },
        { arrival_station: "Station A" },
      ],
    });

    expect(mockSort).toHaveBeenCalledWith({ departure_time: -1 });
    expect(result).toEqual(schedules);
  });

  it("doit retourner les prochains horaires par station avec limite 6", async () => {
    const schedules = [{ train_id: "train-1" }];
    mockLimit.mockResolvedValue(schedules);

    const result = await service.getUpcomingSchedulesByStation("Station A");

    expect(mockFind).toHaveBeenCalledWith({
      $or: [
        { departure_station: "Station A" },
        { arrival_station: "Station A" },
      ],
      arrival_time: {
        $gte: expect.any(Date),
      },
    });

    expect(mockSort).toHaveBeenCalledWith({ departure_time: 1 });
    expect(mockLimit).toHaveBeenCalledWith(6);
    expect(result).toEqual(schedules);
  });

  it("doit retourner les prochains horaires avec limite 6", async () => {
    const schedules = [{ train_id: "train-1" }];
    mockLimit.mockResolvedValue(schedules);

    const result = await service.getUpcomingSchedules();

    expect(mockFind).toHaveBeenCalledWith({
      arrival_time: {
        $gte: expect.any(Date),
      },
    });

    expect(mockSort).toHaveBeenCalledWith({ departure_time: 1 });
    expect(mockLimit).toHaveBeenCalledWith(6);
    expect(result).toEqual(schedules);
  });
});