/**
 * Preview switch for the dashboards' non-happy states, read from `?mock=`:
 * `empty` (new account, no data), `error` (loader throws) and `slow`
 * (holds the loading skeleton for 1.5 s). Ignored in production builds.
 */
export type MockScenario = "default" | "empty" | "error" | "slow";

export function parseScenario(value: string | string[] | undefined): MockScenario {
  if (process.env.NODE_ENV === "production") return "default";
  const v = Array.isArray(value) ? value[0] : value;
  return v === "empty" || v === "error" || v === "slow" ? v : "default";
}

export async function applyScenario(scenario: MockScenario) {
  if (scenario === "error") throw new Error("Mock dashboard request timed out.");
  if (scenario === "slow") await new Promise((r) => setTimeout(r, 1500));
}
