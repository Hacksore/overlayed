import { axiom } from "@/axiom";
import Config from "@/config";

export const OVERLAYED_DATASET = "overlayed-prod";

/** The name of the metric to track. */
export const MetricNames = {
  /** If the auth to discord was successful or not */
  DiscordAuthed: "discord-auth",
  /** Track user login and limited metadata */
  DiscordUser: "discord-user",
} as const;

type MetricNamesValues = (typeof MetricNames)[keyof typeof MetricNames];

// NOTE: allow opt-out of tracking from the settings UI
const isTelemetryEnabled = () => {
  return import.meta.env.VITE_AXIOM_TOKEN && Config.get("telemetry");
};

console.log("config", await Config.getConfig());
// tell the user if they have telemetry disabled
if(!Config.get("telemetry")) {
  console.warn("Disabling axiom telemetry because the user has disabled it");
} else {
  console.log("Axiom telemetry is enabled!");
}

/** Will track metric was successful or not. */
export const track = (name: MetricNamesValues, status: number) => {
  if (!isTelemetryEnabled()) return;

  axiom.ingest(OVERLAYED_DATASET, [
    {
      event: name,
      status,
    },
  ]);
};

/** Will track metric was successful or not. */
export const trackEvent = (name: MetricNamesValues, payload: unknown) => {
  if (!isTelemetryEnabled()) return;

  axiom.ingest(OVERLAYED_DATASET, [
    {
      event: name,
      payload,
    },
  ]);
};
