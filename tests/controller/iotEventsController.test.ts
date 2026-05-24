import { Request, Response, NextFunction } from "express";
import { IotEventsController } from "../../src/controllers/iotEventsController";
import { IotEventsService } from "../../src/services/iotEventsService";

jest.mock("../../src/services/iotEventsService", () => ({
  IotEventsService: jest.fn().mockImplementation(function (this: {
    createEvent: jest.Mock;
    getEventsByDevice: jest.Mock;
  }) {
    this.createEvent = jest.fn();
    this.getEventsByDevice = jest.fn();
  }),
}));

const mockedIotEventsService = IotEventsService as unknown as jest.Mock;

describe("IotEventsController", () => {
  let controller: IotEventsController;
  let res: Pick<Response, "status" | "json">;
  let next: NextFunction;
  let serviceInstance: {
    createEvent: jest.Mock;
    getEventsByDevice: jest.Mock;
  };

  beforeEach(() => {
    // On réinitialise les méthodes du service mocké sans recréer le contrôleur.
    serviceInstance = mockedIotEventsService.mock.instances[0] as {
      createEvent: jest.Mock;
      getEventsByDevice: jest.Mock;
    };
    serviceInstance.createEvent.mockReset();
    serviceInstance.getEventsByDevice.mockReset();

    controller = new IotEventsController();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("doit retourner 400 quand des champs IoT obligatoires manquent", async () => {
    // Préparation : la requête ne contient pas le payload complet attendu par l'API.
    const req = {
      body: {
        device_id: "device-1",
        event_type: "temperature",
      },
    } as Request;

    // Action : on déclenche la méthode du contrôleur.
    await controller.receiveEvent(req, res as Response, next);

    // Vérification : le contrôleur bloque la requête avant d'appeler le service.
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing required IoT fields",
    });
    expect(serviceInstance.createEvent).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("doit créer un événement IoT et retourner 201", async () => {
    // Préparation : le service simule un événement correctement enregistré.
    const createdEvent = {
      device_id: "device-1",
      event_type: "temperature",
      station: "Central",
      payload: '{"value":24}',
    };
    serviceInstance.createEvent.mockResolvedValue(createdEvent);

    const req = {
      body: {
        device_id: "device-1",
        event_type: "temperature",
        station: "Central",
        payload: { value: 24 },
      },
    } as Request;

    // Action : on transmet une requête valide au contrôleur.
    await controller.receiveEvent(req, res as Response, next);

    // Vérification : les données sont normalisées puis renvoyées dans la réponse.
    expect(serviceInstance.createEvent).toHaveBeenCalledWith({
      device_id: "device-1",
      event_type: "temperature",
      station: "Central",
      payload: JSON.stringify({ value: 24 }),
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "IoT event received",
      data: createdEvent,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("doit retourner les événements du device avec le statut 200", async () => {
    // Préparation : le service renvoie plusieurs événements pour ce device.
    const events = [{ device_id: "device-1" }, { device_id: "device-1" }];
    serviceInstance.getEventsByDevice.mockResolvedValue(events);

    const req = {
      params: {
        deviceId: "device-1",
      },
    } as Request<{ deviceId: string }>;

    // Action : on demande les événements d'un device précis.
    await controller.getDeviceEvents(req, res as Response, next);

    // Vérification : la réponse HTTP contient exactement la liste du service.
    expect(serviceInstance.getEventsByDevice).toHaveBeenCalledWith("device-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(events);
    expect(next).not.toHaveBeenCalled();
  });
});