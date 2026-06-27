import type { Graph } from "../graph/graph.js";
import type { Route } from "../graph/routes.js";
import type { RouteFilter } from "./types.js";

export const startsPublic: RouteFilter = {
  name: "startsPublic",
  description: "Routes that start in a public service (publicExposed: true).",
  matches(route: Route, graph: Graph): boolean {
    const start = route.nodes[0];
    return graph.getNode(start)?.publicExposed === true;
  },
};
