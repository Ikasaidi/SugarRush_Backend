import { Document, Types } from "mongoose";

export interface ITrainSchedules extends Document {
    train_id: string;
    departure_station: string;
    arrival_station: string;
    departure_time: Date;
    arrival_time: Date;
    created_at?: Date;
}