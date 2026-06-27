export interface Vulnerability {
  file?: string;
  severity?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface RawNode {
  name: string;
  kind: string;
  language?: string;
  path?: string;
  publicExposed?: boolean;
  vulnerabilities?: Vulnerability[];
  metadata?: Record<string, unknown>;
}

/** `to` is `string | string[]` because the source data uses both forms. */
export interface RawEdge {
  from: string;
  to: string | string[];
}

export interface RawGraph {
  nodes: RawNode[];
  edges: RawEdge[];
}

/** `synthetic` marks nodes referenced by edges but missing from `nodes` (e.g. assurance-service). */
export interface GraphNode extends RawNode {
  synthetic?: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
}
