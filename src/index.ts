import { loadGraphFromFile } from "./graph/loader.js";
import { createDefaultRegistry } from "./filters/index.js";
import { QueryEngine } from "./services/index.js";
import { createServer } from "./api/server.js";
import { config, validateConfig } from "./config/index.js";
import { log } from "./utils/logger.js";
import { StartupMessages } from "./constants/messages.js";

function main(): void {
  validateConfig();

  const graph = loadGraphFromFile(config.graph.dataPath);
  if (graph.warnings.length > 0) {
    log.warn(StartupMessages.GRAPH_WARNINGS_HEADER);
    for (const w of graph.warnings) log.warn(`${StartupMessages.GRAPH_WARNING_PREFIX}${w}`);
  }

  const registry = createDefaultRegistry();
  const engine = new QueryEngine(graph, registry);
  const app = createServer(engine, registry);

  app.listen(config.server.port, () => {
    log.info(StartupMessages.SERVER_LISTENING(config.server.port));
    log.info(StartupMessages.GRAPH_LOADED(graph.nodes().length, graph.edges.length));
    log.info(StartupMessages.EXAMPLE_QUERY);
  });
}

main();
