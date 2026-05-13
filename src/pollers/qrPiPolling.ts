import { getPiData, postPiData } from "../services/iotHttpClient";
import { IOT_DEVICES } from "../config/iotDevices";
import { validateScannedQr } from "../services/QrCodeService";
import { IotEventsService } from "../services/iotEventsService";

const iotService = new IotEventsService();

type QrPiStatus = {
  has_scan: boolean;
  qr_data: string | null;
  scanned_at: string | null;
};

let lastQrData: string | null = null;
let lastQrProcessedAt = 0;
let isProcessing = false;
let piWasDown = false;

const SAME_QR_COOLDOWN_MS = 5000;

export function startQrPiPolling() {
  console.log("Initializing QR Pi polling...");

  setInterval(async () => {
    if (isProcessing) return;

    try {

      isProcessing = true;

      const data = await getPiData<QrPiStatus>(
        `${IOT_DEVICES.qrPi.baseUrl}/qr-status`
      );

      if (piWasDown) {
        console.log("QR Pi is reachable again");
        piWasDown = false;
      }

      if (!data.has_scan || !data.qr_data) {
        return;
      }

      const now = Date.now();
      const isSameQr = data.qr_data === lastQrData;
      const tooSoon =
        now - lastQrProcessedAt < SAME_QR_COOLDOWN_MS;

      if (isSameQr && tooSoon) {
        console.log("Duplicate QR ignored:", data.qr_data);

        // IMPORTANT : clear pour éviter boucle infinie
        await postPiData(
          `${IOT_DEVICES.qrPi.baseUrl}/qr-clear`
        );

        return;
      }

      lastQrData = data.qr_data;
      lastQrProcessedAt = now;

      console.log("New QR from Pi:", data.qr_data);

      const result = await validateScannedQr(data.qr_data);

      console.log("Validation result:", result);

      await iotService.createEvent({
        device_id: IOT_DEVICES.qrPi.deviceId,

        event_type: result.allowed
          ? "QR_ACCESS_GRANTED"
          : "QR_ACCESS_DENIED",

        station: "station-2",

        payload: JSON.stringify({
          qr_data: data.qr_data,
          scanned_at: data.scanned_at,
          allowed: result.allowed,
          validation_result: result,
          source: "backend_qr_pi_poll", 
        }),
      });

      await postPiData(
        `${IOT_DEVICES.qrPi.baseUrl}/qr-result`,
        {
          allowed: result.allowed,
        }
      );

      const clearResult = await postPiData(
        `${IOT_DEVICES.qrPi.baseUrl}/qr-clear`
      );

      console.log("QR cleared on Pi:", clearResult);

    } catch (err: any) {
      if (!piWasDown) {
        console.log(
          "QR Pi unreachable:",
          IOT_DEVICES.qrPi.baseUrl,
          "-",
          err?.message || err
        );

        piWasDown = true;
      }
    } finally {
      isProcessing = false;
    }
  }, 500);
}