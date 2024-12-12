import { OpenAPIV3 } from 'openapi-types';
import getExampleValue from '../getExampleValue';
import { AutogenComment } from '../utils';

export default function buildRouteHandler(operationObject: OpenAPIV3.OperationObject, name?: string): string {
  let headers = '{ }';
  let body = '{ }';
  const first2xxResponse: string | undefined = Object.keys(operationObject.responses).find((key: string) => key.startsWith('20'));
  if (first2xxResponse) {
    const response = operationObject.responses[first2xxResponse] as OpenAPIV3.ResponseObject;
    headers = getHeaders(response);
    body = getBody(response);
  } else {
    console.error(`No success response for handler ${name}`);
  }

  return `
  ${AutogenComment}
  import { Request, Response } from 'miragejs';
  import type { AppSchema } from '../mirage-types.d.ts'

  export default (schema: AppSchema, request: Request) => {
    const headers = ${headers};
    const body = ${body};

    return new Response(200, headers, body);
  };
`;
}

export function getBody(response: OpenAPIV3.ResponseObject): string {
  let body: string = '';
  if (response.content && response.content["application/json"]) {
    return getExampleValue(response.content["application/json"].schema as OpenAPIV3.SchemaObject);
  }
  return `{ ${body} }`;
}

export function getHeaders(response: OpenAPIV3.ResponseObject): string {
  let headers: string = '';
  if (response.headers) {
    for (const headerName in response.headers) {
      // @ts-expect-error references have been removed
      const exampleValue = response.headers[headerName].schema.type === 'integer' ? 1 : '\"val\"';
      headers += `\"${headerName.toLowerCase()}\": ${exampleValue}, `;
    }
  }
  return `{ ${headers} }`;
};