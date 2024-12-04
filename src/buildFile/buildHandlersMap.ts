import type { HandlerConfig } from '../getRouteHandlerConfig';
import { AutogenComment } from '../utils';

// Replace URL path params with mirage path param syntax
// e.g. /coffee/{cupId} -> /coffee:cupId
function miragePath(path: string) {
  return path.replace(/\/\{([^}]+)\}/g, ':$1');
}

export default function (handlers: HandlerConfig[]): string {
  const imports = handlers.reduce((fileString, handler) => {
    return `import ${handler.name} from \'./handlers/${handler.name}\'\n${fileString}`;
  }, '');

  const mapPuts = handlers.reduce((fileString, handler) => {
    const config = { verb: handler.method, path: miragePath(handler.path) };
    return `handlersMap.set(${JSON.stringify(config)}, ${handler.name})\n${fileString}`;
  }, '');

  return `${AutogenComment}
  ${imports}import { Request } from 'miragejs';

  export type HandlerRequest = {
    verb: 'get' | 'post' | 'put' | 'patch' | 'delete';
    path: string;
  };
  export type MirageRouteHandler = (schema: any, request: Request) => any;

  export const handlersMap = new Map<HandlerRequest, MirageRouteHandler>();
  ${mapPuts}`;
}