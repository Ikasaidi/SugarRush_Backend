import axios from "axios";
import { IotEventsService } from "../services/iotEventsService"

const iotService = new IotEventsService();

// l'IP du Pi 
const PI_STATUS_URL = "http://10.10.26.36:3001/status";
const DEVICE_ID = "rasp50";
const STATION = "station-1";

type PiStatus = {
  distance_cm: number | null;
  train_present: boolean;
  gate_state: string | null;
  last_change_time: string | null;
};

let lastTrainPresent: boolean | null = null;

export function startPiPolling() {
  setInterval(async () => {
    try {
      const { data } = await axios.get<PiStatus>(PI_STATUS_URL, { timeout: 1500 });

      const train = data.train_present;

      // 1ère lecture: sans créer d’event
      if (lastTrainPresent === null) {
        lastTrainPresent = train;
        return;
      }

      // si changement -> créer un event en bd
      if (train !== lastTrainPresent) {
        const eventType = train ? "TRAIN_DETECTED" : "TRAIN_LEFT";

        await iotService.createEvent({
          device_id: DEVICE_ID,
          event_type: eventType,
          station: STATION,
          payload: JSON.stringify({
            distance_cm: data.distance_cm,
            gate_state: data.gate_state,
            last_change_time: data.last_change_time,
            source: "backend_poll"
          }),
        });

        lastTrainPresent = train;
      }
    } catch (err: any) {
      // si le Pi est down, on log (pas de crash)
      console.log("Pi poll error:", err?.message || err);
    }
  }, 500); 
}
