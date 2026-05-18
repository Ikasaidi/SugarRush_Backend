import axios from "axios";
import { IotEventsService } from "../services/iotEventsService";
import { IOT_DEVICES } from "../config/iotDevices";
import { generatePredictedSchedules } from "../services/TrainSchedulePredictionService";
import { trainRuntimeState } from "../services/trainRuntimeState";
import { TrainSchedulesService } from "../services/TrainScedulesService";

const iotService = new IotEventsService();
const trainSchedulesService = new TrainSchedulesService();

const TRAIN_PI = IOT_DEVICES.trainPi;

const PI_STATUS_URL = `${TRAIN_PI.baseUrl}/status`;
const DEVICE_ID = TRAIN_PI.deviceId;

type PiStatus = {
  distance_station1_cm: number | null;
  distance_station2_cm: number | null;
  expected_station: string;
  train_running: boolean;
  cycle_running: boolean;
  last_station_detected: string | null;
  last_change_time: string | null;
};

let lastTrainRunning: boolean | null = null;
let lastStationDetected: string | null = null;
let lastKnownStation: string | null = null;

let isProcessing = false;
let piWasDown = false;

function normalizeStation(station: string | null | undefined): string {
  if (!station) {
    return "unknown";
  }

  return station.replaceAll("_", "-");
}

export function startTrainPiPolling() {
  console.log(`Train Pi polling started: ${PI_STATUS_URL}`);

  setInterval(async () => {
    if (isProcessing) return;

    try {

      isProcessing = true;

      const { data } = await axios.get<PiStatus>(PI_STATUS_URL, {
        timeout: 5000,
      });

      trainRuntimeState.trainRunning = data.train_running;
      trainRuntimeState.lastSeenAt = new Date();
      trainRuntimeState.serviceStatus = data.train_running ? "running" : "stopped";

      if (piWasDown) {
        console.log("Train Pi is reachable again");
        piWasDown = false;
      }

       // Première lecture
       if (lastTrainRunning === null) {
        lastTrainRunning = data.train_running;

        const detectedStation = normalizeStation(
          data.last_station_detected || data.expected_station
        );

        lastStationDetected = normalizeStation(data.last_station_detected);

        if (detectedStation !== "unknown") {
          lastKnownStation = detectedStation;
          trainRuntimeState.lastKnownStation = detectedStation;
        }

        if (data.train_running) {
          trainRuntimeState.lastStartedAt = new Date();

          if (lastKnownStation) {
            await trainSchedulesService.deleteFutureSchedules(DEVICE_ID);
            await generatePredictedSchedules(DEVICE_ID, lastKnownStation);
          }
        } else {
          trainRuntimeState.lastStoppedAt = new Date();
        }

        return;
      }

      const normalizedStation = normalizeStation(
        data.last_station_detected || data.expected_station,
      );
      // ---------------------------
      // TRAIN START / STOP
      // ---------------------------

      if (data.train_running !== lastTrainRunning) {
        if (data.train_running) {
            trainRuntimeState.lastStartedAt = new Date();
          } else {
            trainRuntimeState.lastStoppedAt = new Date();
          }
        await iotService.createEvent({
          device_id: DEVICE_ID,
          event_type: data.train_running ? "TRAIN_STARTED" : "TRAIN_STOPPED",
          station: normalizedStation,
          payload: JSON.stringify({
            distance_station1_cm: data.distance_station1_cm,
            distance_station2_cm: data.distance_station2_cm,
            expected_station: data.expected_station,
            train_running: data.train_running,
            cycle_running: data.cycle_running,
            last_station_detected: data.last_station_detected,
            last_change_time: data.last_change_time,
            source: "backend_train_pi_poll",
          }),
        });

        console.log(
          `IoT Event created: ${
            data.train_running ? "TRAIN_STARTED" : "TRAIN_STOPPED"
          }`,
        );

        if (data.train_running) {
          if (lastKnownStation) {
            await trainSchedulesService.deleteFutureSchedules(DEVICE_ID);
            await generatePredictedSchedules(DEVICE_ID, lastKnownStation);
          } else {
            console.log("Cannot generate schedules: lastKnownStation is unknown");
          }
        }

        lastTrainRunning = data.train_running;
      }

      // ---------------------------
      // STATION DETECTION
      // ---------------------------

      const currentDetectedStation = normalizeStation(
        data.last_station_detected,
      );

      if (
        data.last_station_detected &&
        currentDetectedStation !== lastStationDetected
      ) {
        await iotService.createEvent({
          device_id: DEVICE_ID,
          event_type: "TRAIN_DETECTED_AT_STATION",
          station: currentDetectedStation,
          payload: JSON.stringify({
            distance_station1_cm: data.distance_station1_cm,
            distance_station2_cm: data.distance_station2_cm,
            expected_station: data.expected_station,
            train_running: data.train_running,
            cycle_running: data.cycle_running,
            last_change_time: data.last_change_time,
            source: "backend_train_pi_poll",
          }),
        });

        console.log(
          `IoT Event created: TRAIN_DETECTED_AT_STATION (${currentDetectedStation})`,
        );
        lastKnownStation = currentDetectedStation;
        trainRuntimeState.lastKnownStation = currentDetectedStation;
        lastStationDetected = currentDetectedStation;
        
      }
    } catch (err: any) {
      if (!piWasDown) {
        console.log(
          "Train Pi unreachable:",
          TRAIN_PI.baseUrl,
          "-",
          err?.message || err,
        );

        piWasDown = true;

        trainRuntimeState.serviceStatus = "offline";
      }
    } finally {
      isProcessing = false;
    }
  }, 500);
}
