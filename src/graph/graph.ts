import type { GraphEdge, GraphNode } from "./types.js";

export class Graph {
  private readonly nodesById = new Map<string, GraphNode>();
  private readonly adjacency = new Map<string, string[]>();
  readonly edges: GraphEdge[] = [];
  readonly warnings: string[] = [];

  addNode(node: GraphNode): void {
    this.nodesById.set(node.name, node);
    if (!this.adjacency.has(node.name)) {
      this.adjacency.set(node.name, []);
    }
  }

  hasNode(name: string): boolean {
    return this.nodesById.has(name);
  }

  getNode(name: string): GraphNode | undefined {
    return this.nodesById.get(name);
  }

  addEdge(from: string, to: string): void {
    const neighbors = this.adjacency.get(from);
    if (!neighbors) {
      this.adjacency.set(from, [to]);
    } else if (!neighbors.includes(to)) {
      neighbors.push(to);
    }
    this.edges.push({ from, to });
  }

  neighbors(name: string): readonly string[] {
    return this.adjacency.get(name) ?? [];
  }

  nodes(): GraphNode[] {
    return [...this.nodesById.values()];
  }

  nodeNames(): string[] {
    return [...this.nodesById.keys()];
  }
}
