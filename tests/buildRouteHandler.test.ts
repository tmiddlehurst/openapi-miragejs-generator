import { expect, test, describe } from 'bun:test';
import buildRouteHandler, { getBody, getHeaders } from '../src/buildFile/buildRouteHandler';
import { AutogenComment, format } from '../src/utils';

const exampleRouteHandler = `${AutogenComment}
import { Request, Response } from 'miragejs';\nimport type { AppSchema } from '../mirage-types.d.ts'\n\nexport default (schema: AppSchema, request: Request) => {\n  const headers = {};\n  const body = {\n    note: {\n      memberLoginName: 'EXAMPLEUSER1',\n      text: 'This is a note',\n      adminUserLoginName: 'Example.Name',\n      isHiddenInAdminGui: true,\n      created: '2021-01-01T00:00:00Z'\n    }\n  };\n\n  return new Response(200, headers, body);\n};\n`;

const exampleRouteHandlerNoContent = `${AutogenComment}
  import { Request, Response } from 'miragejs';
  import type { AppSchema } from '../mirage-types.d.ts'

  export default (schema: AppSchema, request: Request) => {
    const headers = {};
    const body = {};

    return new Response(200, headers, body);
  };
`;

describe('Building a route handler file', () => {

  test('builds headers for response with headers', () => {
    const exampleResponse = require('./test-specs/responses/200-with-headers-and-content.json');
    const expected = '{ \"x-rate-limit-limit\": 1, \"x-rate-limit-reset\": 1,  }';

    expect(getHeaders(exampleResponse)).toEqual(expected);
  });

  test('builds headers for response without headers', () => {
    const exampleResponse = require('./test-specs/responses/200-empty.json');
    const expected = '{  }';

    expect(getHeaders(exampleResponse)).toEqual(expected);
  });

  test('builds body for empty response', () => {
    const exampleResponse = require('./test-specs/responses/200-empty.json');
    const expected = '{  }';

    expect(getBody(exampleResponse)).toEqual(expected);
  });

  test('builds body for response', () => {
    const exampleResponse = require('./test-specs/responses/200-with-headers-and-content.json');
    const res = getBody(exampleResponse);

    expect(res.replace(/\s/g, '')).toMatch(/\[(\{name:"[^"]*",tag:"[^"]*"\},?)*\]/);
  });

  test('builds an handler file from empty response', async () => {
    const exampleOperation = require('./test-specs/operations/put-returning-empty-body.json');
    const res = buildRouteHandler(exampleOperation);
    const testInput = await format(res);
    const expected = await format(exampleRouteHandlerNoContent);

    expect(testInput).toEqual(expected);
  });

  test('builds an handler file with examples', async () => {
    const exampleOperation = require('./test-specs/operations/get-returning-body-with-examples.json');
    const res = buildRouteHandler(exampleOperation);
    const testInput = await format(res);
    const expected = await format(exampleRouteHandler);
    expect(testInput).toEqual(expected);
  });

  test('builds an handler file', async () => {
    const exampleOperation = require('./test-specs/operations/get-returning-headers-and-body.json');
    const res = buildRouteHandler(exampleOperation);

    expect(res.length).toBeGreaterThan(0);
  });

  test('handles API which has 204 instead of 200', async () => {

  });

  // test('builds an handler file with refs', () => {});

  // test('builds an handler file returning a model', () => {});

});