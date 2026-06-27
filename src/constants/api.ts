export const ApiRoutes = {
  HEALTH: "/api/health",
  FILTERS: "/api/filters",
  GRAPH: "/api/graph",
  ROUTES: "/api/routes",
} as const;

export const QueryParams = {
  FILTERS: "filters",
  MATCH: "match",
} as const;

export const HealthStatus = {
  OK: "ok",
} as const;
