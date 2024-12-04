import type { OpenAPIV3 } from 'openapi-types';
import getExampleValue, { exampleObjectFromSchema, examplePrimitive } from '../src/getExampleValue';
import { test, describe, expect } from 'bun:test';

describe('Getting field values', () => {

  test('gets example primitive value for a field', () => {
    expect(typeof examplePrimitive('number', 'total')).toBe('number');
    expect(typeof examplePrimitive('number', 'timestamp')).toBe('number');
    expect(typeof examplePrimitive('string', 'date')).toBe('string');
    expect(typeof examplePrimitive('string', 'country')).toBe('string');
    expect(typeof examplePrimitive('string', 'foo')).toBe('string');
    expect(typeof examplePrimitive('string', 'name')).toBe('string');
    expect(typeof examplePrimitive('number', 'bar')).toBe('number');
    expect(typeof examplePrimitive('boolean', 'baz')).toBe('boolean');
    expect(examplePrimitive('string', 'startDate')).toMatch(/^\"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\"$/);
  });

  test('gets value for string enum property', () => {
    const propertyName = 'PutOrCall';
    const property: OpenAPIV3.SchemaObject = {
      "type": "string",
      "enum": [
        "Put",
        "Call",
        "Chooser",
        "Other",
        "DEFAULT"
      ]
    };

    expect(getExampleValue(property, propertyName)).toBe('\"Put\"');
  });

  test('gets value for string property with example', () => {
    const propertyName = 'SecurityID';
    const property: OpenAPIV3.SchemaObject = {
      "type": "string",
      "example": "202405220923260000235870D"
    };

    expect(getExampleValue(property, propertyName)).toBe('\"202405220923260000235870D\"');
  });

  test('gets value for number property with example', () => {
    const propertyName = 'maturityDate';
    const property: OpenAPIV3.SchemaObject = {
      "type": "number",
      "example": 20240524
    };
    expect(getExampleValue(property, propertyName)).toBe(20240524);
  });

  test('gets value for integer property with example', () => {
    const propertyName = 'maturityDate';
    const property: OpenAPIV3.SchemaObject = {
      "type": "integer",
      "example": 20240524
    };

    expect(getExampleValue(property, propertyName)).toBe(20240524);
  });

  test('gets value for array property of type string with example', () => {
    const propertyName = 'transactions';
    const property: OpenAPIV3.SchemaObject = {
      "type": "array",
      "items": {
        "type": "string"
      },
      "example": [
        "Buy Groceries",
        "Buy Coffee"
      ]
    };

    expect(getExampleValue(property, propertyName)).toBe('[\"Buy Groceries\", \"Buy Coffee\", ]');
  });

  test('gets value for string property', () => {
    const propertyName = 'SecurityID';
    const property: OpenAPIV3.SchemaObject = {
      "type": "string",
    };

    expect(typeof getExampleValue(property, propertyName)).toBe("string");
  });

  test('gets value for integer property', () => {
    const propertyName = 'SecurityID';
    const property: OpenAPIV3.SchemaObject = {
      "type": "integer",
    };

    expect(typeof getExampleValue(property, propertyName)).toBe("number");
  });

  test('gets value for number property', () => {
    const propertyName = 'SecurityID';
    const property: OpenAPIV3.SchemaObject = {
      "type": "number",
    };

    expect(typeof getExampleValue(property, propertyName)).toBe("number");
  });

  test('gets value for boolean property', () => {
    const propertyName = 'SecurityID';
    const property: OpenAPIV3.SchemaObject = {
      "type": "boolean",
    };

    expect(typeof getExampleValue(property, propertyName)).toBe("boolean");
  });

  test('gets value for array of strings', () => {
    const propertyName = 'Dogs';
    const property: OpenAPIV3.SchemaObject = {
      type: "array",
      items: {
        type: "string",
      }
    };
    const res = getExampleValue(property, propertyName);

    expect(res).toMatch(/^\["[^"]*"(,"[^"]*"){0,4}\]$/g);
  });

  test('get values for schema which has oneOf', () => {
    const example = require('./test-specs/schemas/withOneOf.json');
    const output = getExampleValue(example);

    expect(output).toMatch(/\{ age:[0-9]*,nickname:\"[^"]*\" \}/);
  });

  test('get values for schema which has anyOf', () => {
    const example = require('./test-specs/schemas/withAnyOf.json');
    const output = getExampleValue(example);

    expect(output).toMatch(/\{ age:[0-9]*,nickname:\"[^"]*\" \}/);
  });

  test('get values for schema which has allOf', () => {
    const example = require('./test-specs/schemas/withAllOf.json');
    const output = getExampleValue(example);

    expect(output).toMatch(/\{ age:[0-9]*,nickname:\"[^"]*\",pet_type:\"Cat\",hunts:true \}/);
  });

  test('exampleObjectFromSchema gets example values for shallow object', () => {
    const propertyName = 'NestedProp';
    const property: OpenAPIV3.SchemaObject = {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        age: {
          type: "number",
        }
      }
    };
    const res = exampleObjectFromSchema(property, propertyName);

    expect(res).toMatch(/{\s+name:\"[A-z-.,\s]*\",age:[0-9]*\s+}/);
  });

  test('exampleObjectFromSchema for 200 response', () => {
    const exampleResponse = require('./test-specs/responses/200-with-headers-and-content.json');
    const res = getExampleValue(exampleResponse.content["application/json"].schema, '200-test');

    expect(typeof res).toEqual('string');
    expect(res.length).toBeGreaterThan(0);
  });

  test('exampleObjectFromSchema gets example values for nested object', () => {
    const propertyName = 'NestedProp';
    const property: OpenAPIV3.SchemaObject = {
      type: "object",
      properties: {
        level1: {
          type: "object",
          properties: {
            level2: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                age: {
                  type: "number",
                }
              }
            }
          }
        }
      }
    };
    const res = exampleObjectFromSchema(property, propertyName);

    expect(res).toMatch(/{ level1:{ level2:{ name:\"[A-z-.,\s]*\",age:[0-9]*\s+}\s+}\s+}/);
  });

  test('exampleObjectFromSchema builds an example string:string dictionary when properties and additionalProperties are present', () => {
    const example = require('./test-specs/schemas/additionalPropertiesStringValues.json');

    expect(getExampleValue(example)).toMatch(/\{ message:\"[^"]*\",context:\{ additionalProperty1:\"[^"]*\" \} \}/);
  });

  test('exampleObjectFromSchema builds an example string:string dictionary when only additionalProperties are present', () => {
    const example = require('./test-specs/schemas/onlyAdditionalPropertiesStringValues.json');

    expect(getExampleValue(example)).toMatch(/\{ additionalProperty1:\"[^"]*\" \}/);
  });

  test('exampleObjectFromSchema builds an example string:integer dictionary when additionalProperties are present', () => {
    const example = require('./test-specs/schemas/additionalPropertiesIntegerValues.json');

    expect(getExampleValue(example)).toMatch(/\{ message:\"[^"]*\",context:\{ additionalProperty1:[0-9]* \} \}/);
  });

  test('exampleObjectFromSchema builds an example string:object dictionary when additionalProperties are present', () => {
    const example = require('./test-specs/schemas/additionalPropertiesObjectValues.json');

    expect(getExampleValue(example)).toMatch(/\{ message:\"[^"]*\",context:\{ additionalProperty1:\{ title:\"[^"]*\",description:\"[^"]*\" \} \} \}/);
  });

});
