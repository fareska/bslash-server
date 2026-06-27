import type { Graph } from "../graph/graph.js";
import { enumerateRoutes, type EnumerateOptions, type Route } from "../graph/routes.js";
import { routeMatches, type FilterRegistry } from "../filters/registry.js";
import type { MatchMode } from "../filters/types.js";
import {
  buildQueryResult,
  type GraphPayload,
  type QueryResult,
} from "../controllers/mappers/queryMapper.js";

export type { GraphPayload, QueryResult } from "../controllers/mappers/queryMapper.js";

export interface QueryParams {
  filterNames: string[];
  mode: MatchMode;
}

export class QueryEngine {
  private routesCache?: Route[];

  constructor(
    private readonly graph: Graph,
    private readonly registry: FilterRegistry,
    private readonly enumerateOptions: EnumerateOptions = {},
  ) {}

  fullGraph(): GraphPayload {
    return { nodes: this.graph.nodes(), edges: this.graph.edges };
  }

  private routes(): Route[] {
    if (!this.routesCache) {
      this.routesCache = enumerateRoutes(this.graph, this.enumerateOptions);
    }
    return this.routesCache;
  }

  query({ filterNames, mode }: QueryParams): QueryResult {
    const filters = this.registry.resolve(filterNames);
    const all = this.routes();
    const matched = all.filter((route) => routeMatches(route, this.graph, filters, mode));

    return buildQueryResult(this.graph, filterNames, mode, all, matched);
  }
}
