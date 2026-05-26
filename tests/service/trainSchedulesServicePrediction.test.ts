
jest.mock("../../src/services/TrainScedulesService", () => ({
  TrainSchedulesService: jest.fn().mockImplementation(() => ({
    createSchedule: mockCreateSchedule,
  })),
}));

const mockCreateSchedule = jest.fn();

import { generatePredictedSchedules } from "../../src/services/TrainSchedulePredictionService";



describe("generatePredictedSchedules", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-25T10:00:00.000Z"));
    mockCreateSchedule.mockResolvedValue({});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("doit générer 6 horaires prédits pour le train", async () => {
    await generatePredictedSchedules("train-1", "station-2");

    expect(mockCreateSchedule).toHaveBeenCalledTimes(6);

    expect(mockCreateSchedule).toHaveBeenNthCalledWith(1, {
      train_id: "train-1",
      departure_station: "station-2",
      arrival_station: "station-1",
      departure_time: new Date("2026-05-25T10:00:00.000Z"),
      arrival_time: new Date("2026-05-25T10:00:22.840Z"),
    });

    expect(mockCreateSchedule).toHaveBeenNthCalledWith(2, {
      train_id: "train-1",
      departure_station: "station-1",
      arrival_station: "station-2",
      departure_time: new Date("2026-05-25T10:01:22.840Z"),
      arrival_time: new Date("2026-05-25T10:01:46.010Z"),
    });
  });

  it("doit lancer une erreur si la station de départ est inconnue", async () => {
    await expect(
      generatePredictedSchedules("train-1", "station-x")
    ).rejects.toThrow("Unknown station: station-x");

    expect(mockCreateSchedule).not.toHaveBeenCalled();
  });
});