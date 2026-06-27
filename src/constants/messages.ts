import { ApiRoutes } from "./api.js";

export const EnvVars = {
  PORT: "PORT",
  GRAPH_DATA_PATH: "GRAPH_DATA_PATH",
  NODE_ENV: "NODE_ENV",
} as const;

export const StartupMessages = {
  GRAPH_WARNINGS_HEADER: "Graph loaded with warnings:",
  GRAPH_WARNING_PREFIX: "  - ",
  SERVER_LISTENING: (port: number) =>
    `Attack-path query engine listening on http://localhost:${port}`,
  GRAPH_LOADED: (nodeCount: number, edgeCount: number) =>
    `Loaded ${nodeCount} nodes and ${edgeCount} edges.`,
  EXAMPLE_QUERY: `Try: GET ${ApiRoutes.ROUTES}?filters=startsPublic,endsAtSink&match=all`,
} as const;

export const LoaderMessages = {
  syntheticNodeWarning: (name: string) =>
    `Edge references undeclared node "${name}"; added as synthetic node.`,
} as const;

export const RegistryMessages = {
  duplicateFilter: (name: string) => `Filter "${name}" is already registered.`,
} as const;

export const ErrorMessages = {
  unknownFilters: (unknown: string[], available: string[]) =>
    `Unknown filter(s): ${unknown.join(", ")}. Available: ${available.join(", ")}`,
  invalidPort: (value: string | number) => `Invalid PORT: ${value}`,
  graphDataNotReadable: (path: string) => `Graph data file not readable: ${path}`,
} as const;

export const ServerLogMessages = {
  UNHANDLED_ERROR: "Unhandled error:",
} as const;
