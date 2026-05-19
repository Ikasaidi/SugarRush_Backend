export const trainRuntimeState = {
  trainRunning: false,
  lastSeenAt: null as Date | null,
  lastStartedAt: null as Date | null,
  lastStoppedAt: null as Date | null,
  lastKnownStation: "station-2" as string,
  serviceStatus: "stopped" as "running" | "stopped" | "offline" | "paused",
};