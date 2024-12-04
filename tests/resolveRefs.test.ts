import resolveRefs, { getWithNestedPath } from '../src/resolveRefs';
import { test, describe, expect } from 'bun:test';
import shallowRefs from './test-specs/resolving-refs/shallow-refs.json';
import nestedRefs from './test-specs/resolving-refs/nested-refs.json';

test('getting with a nested path', () => {
  const input = JSON.parse(`{
    "paths": {
      "/pets/{id}": {
        "delete": {
          "responses": {
            "default": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Error"
                  }
                }
              }
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "Error": {
          "type": "object",
          "properties": {
            "message": {
              "type": "string"
            }
          }
        }
      }
    }
  }`);
  expect(getWithNestedPath(input, ['paths', '/pets/{id}', 'delete', 'responses', 'default', 'content', 'application/json', 'schema', '$ref'])).toEqual("#/components/schemas/Error");
});

describe('resolving $refs in document', () => {
  test('resolves shallow $refs', () => {
    const input = shallowRefs;
    expect(resolveRefs(input).paths).toEqual({
      // @ts-expect-error this is a test case so not a real openapi doc
      "/pets/{id}": {
        delete: {
          responses: {
            default: {
              content: {
                "application/json": {
                  schema: {
                    properties: {
                      message: {
                        type: "string",
                      },
                    },
                    type: "object",
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  test('resolves nested $refs', () => {
    const input = nestedRefs;
    expect(resolveRefs(input).paths).toEqual({
      // @ts-expect-error this is a test case so not a real openapi doc
      "/pets/{id}": {
        delete: {
          responses: {
            default: {
              content: {
                "application/json": {
                  schema: {
                    properties: {
                      code: {
                        type: 'string',
                        enum: [
                          "400",
                          "401",
                          "404"
                        ]
                      }
                    },
                    type: "object",
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  test('resolves refs which are in an array', () => {
    const input = require('./test-specs/resolving-refs/refs-in-array.json');
    // @ts-ignore
    expect(resolveRefs(input).paths["/pets"].patch.requestBody.content["application/json"]).toEqual(JSON.parse(`
      {
        "schema": {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "age": {
                  "type": "integer"
                },
                "nickname": {
                  "type": "string"
                }
              },
              "required": [
                "age"
              ]
            },
            {
              "type": "object",
              "properties": {
                "pet_type": {
                  "type": "string",
                  "enum": [
                    "Cat",
                    "Dog"
                  ]
                },
                "hunts": {
                  "type": "boolean"
                }
              },
              "required": [
                "pet_type"
              ]
            }
          ]
        }
      }`));
  });

  // test('what happens if there are circular refs?', () => { });
});