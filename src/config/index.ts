import { accessSync, constants } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ConfigDefaults, EnvVars, ErrorMessages } from "../constants/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface AppConfig {
  server: {
    port: number;
  };
  graph: {
    dataPath: string;
  };
}

const NODE_ENV = process.env[EnvVars.NODE_ENV] ?? ConfigDefaults.NODE_ENV;

export const environment = {
  nodeEnv: NODE_ENV,
  isDevelopment: NODE_ENV === "development",
  isProduction: NODE_ENV === "production",
};

const defaultGraphDataPath = resolve(
  __dirname,
  "../../data",
  ConfigDefaults.GRAPH_DATA_FILE,
);

function loadConfig(): AppConfig {
  const port = Number(process.env[EnvVars.PORT] ?? ConfigDefaults.PORT);
  const dataPath = process.env[EnvVars.GRAPH_DATA_PATH] ?? defaultGraphDataPath;

  return {
    server: { port },
    graph: { dataPath: resolve(dataPath) },
  };
}

export const config: AppConfig = loadConfig();

export function validateConfig(): void {
  if (!Number.isFinite(config.server.port) || config.server.port <= 0) {
    throw new Error(ErrorMessages.invalidPort(process.env[EnvVars.PORT] ?? config.server.port));
  }

  try {
    accessSync(config.graph.dataPath, constants.R_OK);
  } catch {
    throw new Error(ErrorMessages.graphDataNotReadable(config.graph.dataPath));
  }
}
