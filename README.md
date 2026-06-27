# Attack-Path Query Engine

A small RESTful query engine over the **Train Ticket** microservices graph
([FudanSELab/train-ticket](https://github.com/FudanSELab/train-ticket)).

It loads the provided JSON graph, enumerates the routes (paths) between services, and
exposes an API to **filter those routes** with a pluggable, easily-extensible filter
system. Responses are returned as a graph structure (`nodes` + `edges`) that is
straightforward to render in a client.

---

## Quick start

```bash
npm install            # if your global npm cache is healthy
# or, if npm complains about a root-owned cache:
# npm install --cache ./.npm-cache

npm run dev            # start with hot reload (tsx)        -> http://localhost:3000
# or
npm run build && npm start

npm test               # run the unit tests
```

Environment variables:

- `PORT` — server port (default `3000`)
- `GRAPH_DATA_PATH` — path to the graph JSON (default `./data/train-ticket-be.json`)

---

## API

### `GET /api/health`
Liveness check → `{ "status": "ok" }`.

### `GET /api/filters`
Lists the available filters (name + description) so a client can build its UI
dynamically.

### `GET /api/graph`
Returns the full graph as a render-friendly payload:

```json
{ "nodes": [ /* GraphNode */ ], "edges": [ { "from": "...", "to": "..." } ] }
```

### `GET /api/routes`
Returns the routes that match the selected filters, plus the **subgraph** those routes
span (so the client can render exactly the relevant nodes/edges).

Query parameters:

| Param     | Values                                  | Default | Meaning                                   |
| --------- | --------------------------------------- | ------- | ----------------------------------------- |
| `filters` | comma-separated filter names            | (none)  | Which filters to apply                     |
| `match`   | `all` (AND) / `any` (OR)                | `all`   | How to combine multiple filters            |

With no filters, every route is returned.

**Examples**

```bash
# Routes that start public AND end at a sink AND pass a vulnerable node
curl "localhost:3000/api/routes?filters=startsPublic,endsAtSink,hasVulnerability&match=all"

# Routes that start public OR pass a vulnerable node
curl "localhost:3000/api/routes?filters=startsPublic,hasVulnerability&match=any"
```

**Response shape**

```json
{
  "query": {
    "filters": ["endsAtSink"],
    "match": "all",
    "totalRoutes": 440,
    "matchedRoutes": 41
  },
  "routes": [
    { "nodes": ["order-service", "prod-postgresdb"], "length": 2 }
  ],
  "graph": {
    "nodes": [ /* GraphNode objects for nodes spanned by matched routes */ ],
    "edges": [ { "from": "order-service", "to": "prod-postgresdb" } ]
  }
}
```

Unknown filter names return **HTTP 400** with the list of available filters.

---

## The three required filters

| Name              | Meaning                                                      |
| ----------------- | ----------------------------------------------------------- |
| `startsPublic`    | Route starts in a public service (`publicExposed: true`).    |
| `endsAtSink`      | Route ends in a sink (`kind` is `rds` or `sql`).             |
| `hasVulnerability`| Route passes through a node that has a vulnerability.        |

---

## Design

```
src/
  index.ts           # bootstrap (config -> graph -> registry -> engine -> server)
  config/
    index.ts         # typed config, env overrides, validateConfig()
  api/
    server.ts        # Express app factory, error middleware
  routes/
    index.ts         # registerRoutes — wires controllers to paths
  controllers/
    health.controller.ts / filters.controller.ts / graph.controller.ts / routes.controller.ts
    mappers/
      queryMapper.ts # response shaping (spanned subgraph, QueryResult)
  services/
    query.service.ts # QueryEngine (graph + routes + filters)
    index.ts         # barrel
  utils/
    logger.ts        # lightweight console logger
    errors.ts        # AppError, AppErrors, UnknownFilterError
  graph/
    types.ts         # raw input types + normalized graph types
    graph.ts         # in-memory directed graph (adjacency, lookups)
    loader.ts        # parse + normalize JSON -> Graph
    routes.ts        # simple-path (route) enumeration
  filters/
    types.ts         # RouteFilter interface (the extension point)
    registry.ts      # registry + AND/OR combination
    startsPublic.ts / endsAtSink.ts / hasVulnerability.ts
    index.ts         # default registry
```

The pipeline is deliberately layered: **load → enumerate routes → filter → shape
response**. HTTP concerns (controllers, routes) sit above services; domain logic
(graph, filters) stays independent and unit-testable.

### Generic, extensible filtering (the core requirement)

A filter is just a named predicate over a route:

```ts
interface RouteFilter {
  name: string;
  description: string;
  matches(route: Route, graph: Graph): boolean;
}
```

Adding a new filter is a two-step change with **no edits to the engine or API**:

1. Create a file implementing `RouteFilter` (e.g. `severityAtLeast.ts`).
2. Register it in `src/filters/index.ts`.

It then immediately works in `GET /api/routes?filters=...`, shows up in
`GET /api/filters`, and composes with other filters via `match=all|any`. The registry
validates filter names and surfaces clear 400s for unknown ones.

### What is a "route"?

A route is a **simple directed path** (no repeated nodes) through the graph. The engine
enumerates *all* simple paths rather than only paths between specific endpoints, so that
filters — not the traversal — decide what a valid start, end, or intermediate node is.
This keeps the filter system fully generic. Every prefix of a path is also emitted as a
route, because a shorter path can satisfy a filter (e.g. ending at a sink) that a longer
one cannot.

Traversal is bounded by `maxNodes` (default 12) and a `maxRoutes` safety cap; the Train
Ticket graph is sparse, yielding 440 routes well within these bounds.

### Render-friendly responses

Both `/api/graph` and `/api/routes` return `{ nodes, edges }`. For a filtered query, the
returned graph is the **union subgraph spanned by the matched routes**, so a client can
draw precisely the relevant portion plus the raw route list for highlighting/paths.

---

## Assumptions & decisions

- **`to` may be a string or an array.** The source data uses both
  (`consign-service` → single string); the loader normalizes both.
- **Edge to an undeclared node.** The data references `assurance-service`, which is not
  declared in `nodes`. Rather than dropping the edge (losing information) or crashing, the
  loader adds it as a **synthetic** node (`kind: "unknown"`, `synthetic: true`) and records
  a warning. This keeps the graph consistent and renderable.
- **Sinks** are nodes with `kind` in `{ rds, sql }`. The dataset uses `rds`
  (`prod-postgresdb`); `sql` is included to match the wording of the brief. `sqs` is *not*
  treated as a sink for the `endsAtSink` filter (it's a queue, not an rds/sql data store) —
  this is easy to change in one place if desired.
- **Multiple filters default to AND** (`match=all`); `match=any` gives OR. No filters =
  all routes.
- **A route needs at least one edge** (`minNodes = 2`); isolated nodes don't form routes.

### Note on the data

Querying `startsPublic AND endsAtSink AND hasVulnerability` returns **0 routes** — this is
correct for the given edges, not a bug. The only public entry that has outgoing edges is
`frontend`, which only reaches `admin-basic-info-service` and its read-only downstream
services; none of those connect to a sink (`prod-postgresdb`/`prod-sqs`). The individual
filters and their pairwise combinations do return results (e.g. `endsAtSink` → 41 routes).

---

## Tests

`npm test` runs unit tests (Vitest) covering loader normalization & synthetic nodes,
route enumeration, each filter, AND/OR combination, the spanned-subgraph builder, and the
unknown-filter error path.

## Possible extensions

- More filters (by severity, by CWE, by node kind, passes-through-specific-service) —
  each is a small new file + one registration line.
- Endpoint-to-endpoint route queries (`from`/`to` params) layered on the same engine.
- Pagination for large route sets.
