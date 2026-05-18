import { TrainSchedulesService } from "./TrainScedulesService";

const trainSchedulesService = new TrainSchedulesService();

const STOP_TIME_MS = 60_000;
const NUMBER_OF_LOOPS_TO_PREDICT = 3;

const ROUTE = ["station-2", "station-1"] as const;
type Station = (typeof ROUTE)[number];

const TRAVEL_TIMES_MS: Record<string, number> = {
  "station-2->station-1": 22_840,
  "station-1->station-2": 23_170,
};

function getNextStation(currentStation: string): Station {
  const currentIndex = ROUTE.indexOf(currentStation as Station);

  if (currentIndex === -1) {
    throw new Error(`Unknown station: ${currentStation}`);
  }

  const nextStation = ROUTE[(currentIndex + 1) % ROUTE.length];

  if (!nextStation) {
    throw new Error("Next station not found");
  }

  return nextStation;
}

function getTravelTimeMs(from: string, to: string): number {
  const key = `${from}->${to}`;
  const travelTime = TRAVEL_TIMES_MS[key];

  if (!travelTime) {
    throw new Error(`Missing travel time for ${key}`);
  }

  return travelTime;
}

export async function generatePredictedSchedules(
  trainId: string,
  startStation: string
) {
  let currentStation = startStation;
  let currentDepartureTime = new Date();

  const numberOfTrips = NUMBER_OF_LOOPS_TO_PREDICT * ROUTE.length;

  for (let i = 0; i < numberOfTrips; i++) {
    const nextStation = getNextStation(currentStation);
    const travelTimeMs = getTravelTimeMs(currentStation, nextStation);

    const departureTime = currentDepartureTime;
    const arrivalTime = new Date(departureTime.getTime() + travelTimeMs);

    await trainSchedulesService.createSchedule({
      train_id: trainId,
      departure_station: currentStation,
      arrival_station: nextStation,
      departure_time: departureTime,
      arrival_time: arrivalTime,
    });

    currentStation = nextStation;
    currentDepartureTime = new Date(arrivalTime.getTime() + STOP_TIME_MS);
  }
}