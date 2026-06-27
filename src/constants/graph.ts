export const RouteEnumerationDefaults = {
  MIN_NODES: 2,
  MAX_NODES: 12,
  MAX_ROUTES: 50_000,
} as const;

export const SyntheticNode = {
  KIND: "unknown",
} as const;

export const SinkKinds = {
  RDS: "rds",
  SQL: "sql",
} as const;

export const SINK_KINDS = new Set<string>([SinkKinds.RDS, SinkKinds.SQL]);
