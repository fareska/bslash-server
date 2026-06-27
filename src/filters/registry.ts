import type { Graph } from "../graph/graph.js";
import type { Route } from "../graph/routes.js";
import type { MatchMode, RouteFilter } from "./types.js";
import { MatchModes } from "./types.js";
import { UnknownFilterError } from "../utils/errors.js";
import { RegistryMessages } from "../constants/messages.js";

export { UnknownFilterError } from "../utils/errors.js";

export class FilterRegistry {
  private readonly filters = new Map<string, RouteFilter>();

  register(filter: RouteFilter): this {
    if (this.filters.has(filter.name)) {
      throw new Error(RegistryMessages.duplicateFilter(filter.name));
    }
    this.filters.set(filter.name, filter);
    return this;
  }

  has(name: string): boolean {
    return this.filters.has(name);
  }

  get(name: string): RouteFilter | undefined {
    return this.filters.get(name);
  }

  list(): RouteFilter[] {
    return [...this.filters.values()];
  }

  resolve(names: string[]): RouteFilter[] {
    const unknown = names.filter((n) => !this.filters.has(n));
    if (unknown.length > 0) {
      throw new UnknownFilterError(unknown, this.list().map((f) => f.name));
    }
    return names.map((n) => this.filters.get(n)!);
  }
}

export function routeMatches(
  route: Route,
  graph: Graph,
  filters: RouteFilter[],
  mode: MatchMode,
): boolean {
  if (filters.length === 0) return true;
  return mode === MatchModes.ALL
    ? filters.every((f) => f.matches(route, graph))
    : filters.some((f) => f.matches(route, graph));
}
