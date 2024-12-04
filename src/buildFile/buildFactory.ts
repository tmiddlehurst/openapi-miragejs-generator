import type { OpenAPIV3 } from 'openapi-types';
import getExampleValue from '../getExampleValue';
import { AutogenComment } from '../utils';

export default function buildFactoryFile(modelName: string, schemaDefinition: OpenAPIV3.SchemaObject): string {
  const rawFile = `
  ${AutogenComment}
  import { Factory } from 'miragejs';

  export default Factory.extend(
    ${getExampleValue(schemaDefinition, modelName)}
  )
  `;
  return rawFile;
}
