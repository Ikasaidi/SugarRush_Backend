import { Request, Response, NextFunction } from "express";
import { IotEventsService } from "../services/iotEventsService";

const iotEventsService = new IotEventsService();

export class IotEventsController {

    async receiveEvent(req: Request, res: Response, next: NextFunction) {
      try {
        const { device_id, event_type, station, payload } = req.body;
  
        if (!device_id || !event_type || !payload) {
          return res.status(400).json({
            message: "Missing required IoT fields",
          });
        }
  
        const event = await iotEventsService.createEvent({
          device_id,
          event_type,
          station,
          payload: JSON.stringify(payload), // très important
        });
  
        return res.status(201).json({
          message: "IoT event received",
          data: event,
        });
  
      } catch (error) {
        next(error);
      }
    }
  
    async getDeviceEvents(
        req: Request<{ deviceId: string }>,
        res: Response,
        next: NextFunction
      ) {
        try {
          const { deviceId } = req.params;
      
          const events = await iotEventsService.getEventsByDevice(deviceId);
      
          res.status(200).json(events);
        } catch (error) {
          next(error);
        }
      }
      
  }