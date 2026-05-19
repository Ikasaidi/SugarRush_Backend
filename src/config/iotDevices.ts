const trainPiBaseUrl = process.env.TRAIN_PI_BASE_URL || "http://10.10.1.99:5008";
const qrPiBaseUrl = process.env.QR_PI_BASE_URL || "http://10.10.1.100:5001";

export const IOT_DEVICES = {
  trainPi: {
    deviceId: process.env.TRAIN_PI_DEVICE_ID || "rasp50",
    baseUrl: trainPiBaseUrl,
  },
  qrPi: {
    deviceId: process.env.QR_PI_DEVICE_ID || "pi-zero",
    baseUrl: qrPiBaseUrl,
  },
};
