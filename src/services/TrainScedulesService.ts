import { TrainSchedulesModel } from "../models/TrainSchedulesModel";

export class TrainSchedulesService {
  async createSchedule(data: {
    train_id: string;
    departure_station: string;
    arrival_station: string;
    departure_time: Date;
    arrival_time: Date;
  }) {
    const schedule = new TrainSchedulesModel(data);
    return await schedule.save();
  }

  async deleteFutureSchedules(trainId: string) {
    return TrainSchedulesModel.deleteMany({
      train_id: trainId,
      arrival_time: { $gte: new Date() },
    });
  }

  async getAllSchedules() {
    return TrainSchedulesModel.find().sort({ departure_time: -1 });
  }

  async getSchedulesByTrain(trainId: string) {
    return TrainSchedulesModel.find({ train_id: trainId }).sort({
      departure_time: -1,
    });
  }

  async getUpcomingSchedules() {
  const ARRIVAL_GRACE_MS = 10 * 1000;

  return TrainSchedulesModel
    .find({
      arrival_time: {
        $gte: new Date(Date.now() - ARRIVAL_GRACE_MS),
      },
    })
    .sort({ departure_time: 1 })
    .limit(6);
}
}