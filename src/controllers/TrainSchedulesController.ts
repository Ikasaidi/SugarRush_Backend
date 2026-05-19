import { Request, Response, NextFunction } from "express";
import { TrainSchedulesService } from "../services/TrainScedulesService";

const trainSchedulesService = new TrainSchedulesService();

export class TrainSchedulesController {
  getAllSchedules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schedules = await trainSchedulesService.getAllSchedules();
      return res.status(200).json(schedules);
    } catch (error) {
      next(error);
    }
  };

  getSchedulesByTrain = async (
    req: Request<{ trainId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { trainId } = req.params;
      const schedules = await trainSchedulesService.getSchedulesByTrain(trainId);
      return res.status(200).json(schedules);
    } catch (error) {
      next(error);
    }
  };

  getSchedulesByStation = async (
    req: Request<{ station: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { station } = req.params;
      const schedules = await trainSchedulesService.getSchedulesByStation(station);
      return res.status(200).json(schedules);
    } catch (error) {
      next(error);
    }
  };

  getUpcomingSchedules = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const schedules = await trainSchedulesService.getUpcomingSchedules();
      return res.status(200).json(schedules);
    } catch (error) {
      next(error);
    }
  };

  getUpcomingSchedulesByStation = async (
    req: Request<{ station: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { station } = req.params;
      const schedules = await trainSchedulesService.getUpcomingSchedulesByStation(station);
      return res.status(200).json(schedules);
    } catch (error) {
      next(error);
    }
  };
}