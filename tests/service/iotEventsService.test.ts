import { IotEventsService } from "../../src/services/iotEventsService";
import { IotEventsModel } from "../../src/models/IotEventsModel";

const mockSave = jest.fn();
const mockFind = jest.fn();
const mockSort = jest.fn();

jest.mock("../../src/models/IotEventsModel", () => ({
  IotEventsModel: jest.fn(),
}));

const mockedIotEventsModel = IotEventsModel as unknown as jest.Mock & {
  find: jest.Mock;
};

describe("IotEventsService", () => {
  let service: IotEventsService;

  beforeEach(() => {
    // On nettoie les mocks pour éviter qu'un test influence le suivant.
    jest.clearAllMocks();
    service = new IotEventsService();
    mockSort.mockResolvedValue([]);
    mockFind.mockReturnValue({ sort: mockSort });
    mockedIotEventsModel.find = mockFind;
    mockedIotEventsModel.mockImplementation(() => ({
      save: mockSave,
    }));
  });

  it("doit créer et enregistrer un événement IoT", async () => {
    // Préparation : on simule le document Mongoose qui sera enregistré en base.
    const savedEvent = {
      device_id: "device-1",
      event_type: "temperature",
      station: "Central",
      payload: "{\"value\":24}",
    };
    mockSave.mockResolvedValue(savedEvent);

    const result = await service.createEvent({
      device_id: "device-1",
      event_type: "temperature",
      station: "Central",
      payload: "{\"value\":24}",
    });

    expect(mockedIotEventsModel).toHaveBeenCalledWith({
      device_id: "device-1",
      event_type: "temperature",
      station: "Central",
      payload: "{\"value\":24}",
    });
    expect(mockSave).toHaveBeenCalled();
    expect(result).toBe(savedEvent);
  });

  it("doit récupérer les événements du device triés par created_at décroissant", async () => {
    // Préparation : la recherche du modèle renvoie une chaîne de tri simulée.
    const events = [{ device_id: "device-1" }];
    mockSort.mockResolvedValue(events);

    const result = await service.getEventsByDevice("device-1");

    expect(mockFind).toHaveBeenCalledWith({ device_id: "device-1" });
    expect(mockSort).toHaveBeenCalledWith({ created_at: -1 });
    expect(result).toBe(events);
  });
});
