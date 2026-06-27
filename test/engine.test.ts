import { describe, it, expect } from "vitest";
import { buildGraph } from "../src/graph/loader.js";
import { enumerateRoutes } from "../src/graph/routes.js";
import { createDefaultRegistry } from "../src/filters/index.js";
import { QueryEngine } from "../src/services/index.js";
import type { RawGraph } from "../src/graph/types.js";

const fixture: RawGraph = {
  nodes: [
    { name: "pub", kind: "service", publicExposed: true },
    {
      name: "svc",
      kind: "service",
      vulnerabilities: [{ severity: "high", message: "boom" }],
    },
    { name: "db", kind: "rds" },
    { name: "lonely", kind: "service" },
  ],
  edges: [
    { from: "pub", to: ["svc"] },
    { from: "svc", to: "db" },
    { from: "svc", to: "ghost" },
  ],
};

describe("loader", () => {
  it("normalizes string and array `to`, and adds synthetic nodes", () => {
    const g = buildGraph(fixture);
    expect(g.hasNode("ghost")).toBe(true);
    expect(g.getNode("ghost")?.synthetic).toBe(true);
    expect(g.warnings.length).toBe(1);
    expect(g.neighbors("svc")).toContain("db");
    expect(g.neighbors("svc")).toContain("ghost");
  });
});

describe("route enumeration", () => {
  it("emits simple paths including prefixes", () => {
    const g = buildGraph(fixture);
    const routes = enumerateRoutes(g);
    const asStrings = routes.map((r) => r.nodes.join(">"));
    expect(asStrings).toContain("pub>svc");
    expect(asStrings).toContain("pub>svc>db");
    expect(asStrings).toContain("svc>db");
    expect(asStrings.some((s) => s.includes("lonely"))).toBe(false);
  });
});

describe("filters", () => {
  const g = buildGraph(fixture);
  const registry = createDefaultRegistry();
  const engine = new QueryEngine(g, registry);

  it("startsPublic matches only routes beginning at a public node", () => {
    const res = engine.query({ filterNames: ["startsPublic"], mode: "all" });
    expect(res.routes.every((r) => r.nodes[0] === "pub")).toBe(true);
    expect(res.routes.length).toBeGreaterThan(0);
  });

  it("endsAtSink matches only routes ending at rds/sql", () => {
    const res = engine.query({ filterNames: ["endsAtSink"], mode: "all" });
    expect(res.routes.every((r) => r.nodes[r.nodes.length - 1] === "db")).toBe(true);
  });

  it("hasVulnerability matches routes passing a vulnerable node", () => {
    const res = engine.query({ filterNames: ["hasVulnerability"], mode: "all" });
    expect(res.routes.every((r) => r.nodes.includes("svc"))).toBe(true);
  });

  it("combines filters with AND (all)", () => {
    const res = engine.query({
      filterNames: ["startsPublic", "endsAtSink", "hasVulnerability"],
      mode: "all",
    });
    const strings = res.routes.map((r) => r.nodes.join(">"));
    expect(strings).toContain("pub>svc>db");
    expect(strings.every((s) => s === "pub>svc>db")).toBe(true);
  });

  it("combines filters with OR (any)", () => {
    const res = engine.query({
      filterNames: ["startsPublic", "endsAtSink"],
      mode: "any",
    });
    const strings = res.routes.map((r) => r.nodes.join(">"));
    expect(strings).toContain("pub>svc");
    expect(strings).toContain("svc>db");
  });

  it("returns a spanned subgraph for matched routes", () => {
    const res = engine.query({ filterNames: ["endsAtSink"], mode: "all" });
    const names = res.graph.nodes.map((n) => n.name).sort();
    expect(names).toContain("db");
    expect(res.graph.edges).toContainEqual({ from: "svc", to: "db" });
  });

  it("throws on unknown filter", () => {
    expect(() => engine.query({ filterNames: ["nope"], mode: "all" })).toThrow(
      /Unknown filter/,
    );
  });
});
