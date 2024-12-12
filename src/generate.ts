import fs from 'fs';
import path from 'node:path';
import { OpenAPIV3 } from 'openapi-types';
import { getLikelyModels } from './getModels';
import buildServerFile from './buildFile/buildExampleServer';
import { writeFile, type FileToWrite } from './utils';
import buildModelDefinitionsFile from './buildFile/buildModelDefinitions';
import buildFactoryDefinitionsFile from './buildFile/buildFactoryDefinitions';
import buildFactoryFile from './buildFile/buildFactory';
import buildRouteHandler from './buildFile/buildRouteHandler';
import getHandlersFromPaths, { type HandlerConfig } from './getRouteHandlerConfig';
import buildHandlersMap from './buildFile/buildHandlersMap';
import buildIndexFile from './buildFile/buildIndexFile';

export default async function generate(inputSpec: OpenAPIV3.Document, outputDir: string) {
  // Check and create output dir if it does not exist
  try {
    if (!outputDir || typeof outputDir !== "string") {
      console.error("Invalid output dir path provided");
    }
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  } catch (e) {
    throw new Error('Unable to create output dir ');
  }

  let filesToWrite: FileToWrite[] = [];

  /*
  Build file strings for
    - model definitions models.ts
    - factory definitions factories.ts
    - each factory file
  */
  if (inputSpec?.components?.schemas && Object.keys(inputSpec.components.schemas).length) {
    const models = getLikelyModels(inputSpec.components.schemas as Record<string, OpenAPIV3.SchemaObject>);

    if (models.length) {
      const pathToFactories = path.join(outputDir, 'factories');
      if (!fs.existsSync(pathToFactories)) {
        fs.mkdirSync(pathToFactories);
      }
      filesToWrite.push({ fileName: 'models.ts', content: buildModelDefinitionsFile(models) });
      filesToWrite.push({ fileName: 'factories.ts', content: buildFactoryDefinitionsFile(models) });
      models.forEach((modelName: string) => {
        // @ts-expect-error we have checked for presence of inputSpec.components.schemas
        filesToWrite.push({ fileName: `factories/${modelName}.ts`, content: buildFactoryFile(modelName, inputSpec.components?.schemas[modelName] as OpenAPIV3.SchemaObject) });
      });
    }
  }

  /*
  Build file strings for
   - handler definitions file handlers.ts
   - each handler file
  */
  const routeHandlerConfig = getHandlersFromPaths(inputSpec.paths);
  if (routeHandlerConfig.length) {
    const pathToHandlers = path.join(outputDir, 'handlers');
    if (!fs.existsSync(pathToHandlers)) {
      fs.mkdirSync(pathToHandlers);
    }
    routeHandlerConfig.forEach((handler: HandlerConfig) => {
      // @ts-expect-error trust that buildRouteHandler returns correct path and methods
      filesToWrite.push({ fileName: `handlers/${handler.name}.ts`, content: buildRouteHandler(inputSpec.paths[handler.path][handler.method], handler.name) });
    });
    filesToWrite.push({ fileName: 'handlers.ts', content: buildHandlersMap(routeHandlerConfig) });
  }

  filesToWrite.push({ fileName: 'example-server.ts', content: buildServerFile() });
  filesToWrite.push({ fileName: 'index.ts', content: buildIndexFile() });

  for (const fileToWrite of filesToWrite) {
    console.log('writing file: ', fileToWrite.fileName);
    writeFile(fileToWrite, outputDir);
  }
}