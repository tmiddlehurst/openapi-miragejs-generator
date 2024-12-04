import { OpenAPIV3 } from 'openapi-types';
import camelcase from 'camelcase';

type HttpMethod =
  | 'get'
  | 'options'
  | 'post'
  | 'put'
  | 'patch'
  | 'delete';

export type HandlerConfig = {
  method: HttpMethod;
  path: string;
  name: string;
};

export default function getHandlersFromPaths(paths: OpenAPIV3.PathsObject): HandlerConfig[] {
  const handlers: HandlerConfig[] = [];

  for (let path in paths) {
    for (let method in paths[path]) {
      handlers.push({
        // @ts-expect-error method is always an http method, paths[path][method] always exists
        path, method, name: getHandlerName(path, method, paths[path][method])
      });
    }
  }
  return handlers;
}

export function getHandlerName(path: string, httpMethod: HttpMethod, operationSpec: OpenAPIV3.OperationObject) {
  if (operationSpec.operationId) {
    return `${camelcase(operationSpec.operationId)}Handler`;
  }

  const res = path.replace(/\/\{[^}]+\}/g, '') // remove all path params e.g. /{memberId}
    .split('/')                                // split to array by '/'
    .slice(-2)                                 // return <=2 parts of the path, starting at the end
    .join('-');                                // join path sections with '-'

  return camelcase(`${methodToVerb(httpMethod)}-${res}-Handler`); // camelCase() the output with 'Handler' appended
};

/**
 * verb to prepend to handler name
 */
function methodToVerb(method: HttpMethod): string {
  if (method === 'post') {
    return 'add';
  }
  if (['put', 'patch'].includes(method)) {
    return 'update';
  }
  return method;
}
