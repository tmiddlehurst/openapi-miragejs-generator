import buildHandlersMap from '../src/buildFile/buildHandlersMap';
import { describe, test, expect } from 'bun:test';
import { format } from '../src/utils';
import type { HandlerConfig } from '../src/getRouteHandlerConfig';
import { AutogenComment } from '../src/utils';

describe('building map of route handlers', () => {
  test('builds map of handlers', async () => {
    const handlers: HandlerConfig[] = [
      { name: 'getDonutsHandler', path: '/donuts', method: 'get' },
      { name: 'addDonutHandler', path: '/donuts', method: 'post' },
      { name: 'pourCoffeeHandler', path: '/coffee', method: 'put' },
      { name: 'drinkCoffeeHandler', path: '/coffee', method: 'delete' },
    ];

    const expected = await format(`
      ${AutogenComment}
      import drinkCoffeeHandler from './handlers/drinkCoffeeHandler';
      import pourCoffeeHandler from './handlers/pourCoffeeHandler';
      import addDonutHandler from './handlers/addDonutHandler';
      import getDonutsHandler from './handlers/getDonutsHandler';
      import { Request } from 'miragejs';

      export type HandlerRequest = {
        verb: 'get' | 'post' | 'put' | 'patch' | 'delete';
        path: string;
      };
      export type MirageRouteHandler = (schema: any, request: Request) => any;

      export const handlersMap = new Map<HandlerRequest, MirageRouteHandler>;
      handlersMap.set({ verb: \"delete\", path: \"/coffee\" }, drinkCoffeeHandler);
      handlersMap.set({ verb: \"put\", path: \"/coffee\" }, pourCoffeeHandler);
      handlersMap.set({ verb: \"post\", path: \"/donuts\" }, addDonutHandler);
      handlersMap.set({ verb: \"get\", path: \"/donuts\" }, getDonutsHandler);`);
    const input = await format(buildHandlersMap(handlers));
    expect(input).toBe(expected);
  });

  test('replaces url path params with mirage path param syntax', async () => {
    const expected = await format(`
      ${AutogenComment}
      import pourCoffeeHandler from './handlers/pourCoffeeHandler';
      import { Request } from 'miragejs';

      export type HandlerRequest = {
        verb: 'get' | 'post' | 'put' | 'patch' | 'delete';
        path: string;
      };
      export type MirageRouteHandler = (schema: any, request: Request) => any;

      export const handlersMap = new Map<HandlerRequest, MirageRouteHandler>;
      handlersMap.set({ verb: \"put\", path: \"/coffee:cupId\" }, pourCoffeeHandler);`);
    const handlers: HandlerConfig[] = [
      { name: 'pourCoffeeHandler', method: 'put', path: '/coffee/{cupId}' }
    ];
    const input = await format(buildHandlersMap(handlers));
    expect(input).toBe(expected);
  });
});