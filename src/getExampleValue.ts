import { OpenAPIV3 } from 'openapi-types';
import { randomAlpha3CountryCode, randomDate, randomInt } from './utils';

export default function getExampleValue(schema: OpenAPIV3.SchemaObject, schemaName?: string): any {
  if (schemaName) {
    console.debug(`Property ${schemaName} is of type ${schema.type} `);
  }
  if (schema.anyOf) {
    return exampleObjectFromSchema(schema.anyOf[0] as OpenAPIV3.SchemaObject, schemaName);
  }
  if (schema.oneOf) {
    return exampleObjectFromSchema(schema.oneOf[0] as OpenAPIV3.SchemaObject, schemaName);
  }
  if (schema.allOf) {
    return exampleObjectFromSchema(mergeSchemas(schema.allOf as OpenAPIV3.SchemaObject[]));
  }
  if (schema.type === 'array') {
    return exampleArrayFromSchema(schema, schemaName);
  }
  if (schema.type === 'object') {
    return exampleObjectFromSchema(schema, schemaName);
  }
  if (schema.enum) {
    if (schema.type === 'string') {
      // string values must be explicitly wrapped in quotes when added to the file template
      return `"${schema.enum[0]}"`;
    }
    return schema.enum[0];
  }
  if (schema.example) {
    // string values must be explicitly wrapped in quotes when added to the file template
    if (typeof schema.example === 'string') {
      return `"${schema.example}"`;
    }
    return schema.example;
  }

  return examplePrimitive(schema.type || 'string', schemaName);
}

export function exampleObjectFromSchema(schema: OpenAPIV3.SchemaObject, schemaName?: string): string {
  console.debug('Getting values for properties of: ', schemaName);
  let keyValPairs = '';

  if (schema.properties !== undefined) {
    const propertyNames = Object.keys(schema.properties);
    keyValPairs += propertyNames.reduce((props, key, i) => {
      const commaIfNotLastItem = i === propertyNames.length - 1 ? '' : ',';
      // @ts-expect-error we check for undefined
      const value = getExampleValue(schema.properties[key] as OpenAPIV3.SchemaObject, key);
      return `${props}${key}:${value}${commaIfNotLastItem}`;
    }, '');
  }
  if (schema.additionalProperties) {
    const commaIfNotFirst = keyValPairs.length ? ',' : '';
    keyValPairs += `${commaIfNotFirst}additionalProperty1:${getExampleValue(schema.additionalProperties as OpenAPIV3.SchemaObject)}`;
  }

  return `{ ${keyValPairs} }`;
}

function exampleArrayFromSchema(schema: OpenAPIV3.ArraySchemaObject | OpenAPIV3.ArraySchemaObject, schemaName?: string): string {
  if (schema.example) {
    // @ts-expect-error references have been removed
    if (schema.items.type === "string") {
      const safeStrings = schema.example.reduce((acc: string, item: string) => acc + `"${item}", `, '');
      return `[${safeStrings}]`;
    }
    return `[${schema.example}]`;
  }
  const max = schema.maxItems || 5;
  const min = schema.minItems || 1;
  const n = randomInt(max, min);
  const array = [];
  for (let i = 0; i < n; i++) {
    array.push(getExampleValue(schema.items as OpenAPIV3.SchemaObject, schemaName));
  }
  return `[${array}]`;
}

export function examplePrimitive(type: string, propertyName?: string): string | number | boolean | null {
  if (propertyName) {
    if (propertyName.match(/total|amount|value|max|min/i) && ['number', 'integer'].includes(type)) {
      return randomInt(10000);
    }
    if (propertyName.match(/timestamp|ts/i) && ['number', 'integer'].includes(type)) {
      return (randomDate(new Date('2020-01-01T00:00:00.000Z'), new Date('2030-01-01T00:00:00.000Z'))).getMilliseconds();
    }
    if (propertyName.match(/date/i) && type === 'string') {
      const date = randomDate(new Date('2020-01-01T00:00:00.000Z'), new Date('2030-01-01T00:00:00.000Z')).toISOString();
      return `"${date}"`;
    }
    if (propertyName.match(/country/i) && type === 'string') {
      return `"${randomAlpha3CountryCode()}"`;
    }
  }
  if (type === 'boolean') {
    return true;
  }
  if (type === 'string') {
    return `"string"`;
  }
  if (['number', 'integer'].includes(type)) {
    return randomInt();
  }
  return null;
}

function mergeSchemas(schemas: OpenAPIV3.SchemaObject[]): OpenAPIV3.BaseSchemaObject {
  const mergedProperties = schemas.map(s => s.properties);
  return {
    properties: Object.assign({}, ...mergedProperties)
  };
}