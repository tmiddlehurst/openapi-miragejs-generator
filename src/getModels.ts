import type { OpenAPIV3 } from 'openapi-types';
import { isPluralOfOtherSchema } from './utils';

const SCHEMA_NAMES_IGNORE_LIST: string[] = [
  "ERROR", "SORT", "PAGEABLE"
];

export function getLikelyModels(schemas: Record<string, OpenAPIV3.SchemaObject>): string[] {
  const schemaNames = Object.keys(schemas);
  return schemaNames.filter((name) => {
    if (isPluralOfOtherSchema(name, schemaNames)) {
      console.debug(`Schema ${name} disabled since it is plural of other named schema`);
    } else if (SCHEMA_NAMES_IGNORE_LIST.includes(name.toUpperCase())) {
      console.debug(`Schema ${name} option disabled since it is named in schema ignore list`);
    } else if (schemas[name].type !== "object") {
      console.debug(`Excluding schema ${name} since it is not of type "object"`);
    } else {
      return true;
    }
  });
}
