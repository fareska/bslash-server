import { FilterRegistry } from "./registry.js";
import { startsPublic } from "./startsPublic.js";
import { endsAtSink } from "./endsAtSink.js";
import { hasVulnerability } from "./hasVulnerability.js";

export function createDefaultRegistry(): FilterRegistry {
  return new FilterRegistry()
    .register(startsPublic)
    .register(endsAtSink)
    .register(hasVulnerability);
}

export { FilterRegistry } from "./registry.js";
export * from "./types.js";
