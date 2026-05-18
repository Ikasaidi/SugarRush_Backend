import { IotEventsModel } from "../models/IotEventsModel";
import { IIotEvents } from "../interfaces/IIotEvents";

export class IotEventsService {

    async createEvent(data: Partial<IIotEvents>) {
      const event = new IotEventsModel({
        device_id: data.device_id,
        event_type: data.event_type,
        station: data.station,
        payload: data.payload,
      });
  
      return await event.save();
    }
  
    async getEventsByDevice(deviceId: string) {
      return IotEventsModel
        .find({ device_id: deviceId })
        .sort({ created_at: -1 });
    }
  }