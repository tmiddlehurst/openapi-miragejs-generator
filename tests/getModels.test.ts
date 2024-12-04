import { expect, test, describe } from "bun:test";
import { getLikelyModels } from '../src/getModels';
import { OpenAPIV3 } from 'openapi-types';

describe("Prompting member to choose models to define", () => {

  test("removes models with names from ignore list in modelChoices", () => {
    const schemas = {
      MemberNote: {
        type: "object",
        properties: {
          memberLoginName: "string",
          text: "string",
          adminUserLoginName: "string",
        }
      },
      Error: {
        type: "object",
        properties: {
          message: "string",
          text: "string",
          code: "string",
        }
      }
    } as Record<string, OpenAPIV3.SchemaObject>;

    const filteredSchemas = getLikelyModels(schemas);
    expect(filteredSchemas.length).toBe(1);
  });

  test("removes model by default if it is plural of another", () => {
    const schemas = {
      MemberNote: {
        type: "object",
        properties: {
          memberLoginName: "string",
          text: "string",
          adminUserLoginName: "string",
        }
      },
      MemberNotes: {
        type: "object",
        properties: {
          notes: {
            $ref: '#/components/MemberNote'
          },
          count: "integer",
          pageNumber: "integer",
        }
      }
    } as Record<string, OpenAPIV3.SchemaObject>;

    const filteredSchemas = getLikelyModels(schemas);
    expect(filteredSchemas.length).toBe(1);
    expect(filteredSchemas[0]).toBe('MemberNote');
  });

});
