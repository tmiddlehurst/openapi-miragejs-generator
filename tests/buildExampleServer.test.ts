import { describe, test, expect } from 'bun:test';
import buildServerFile from '../src/buildFile/buildExampleServer';
import { AutogenComment, format } from '../src/utils';

const exampleServer = `
    ${AutogenComment}
    import { models, factories, handlersMap } from './index';
    import type { HandlerRequest, MirageRouteHandler } from './index';

    // An example of a server config file.
    // ** you should create this for yourself **

    // The generated mirage models, factories and route handlers are exported in a form that enables
    // them to be added to an existing mirage server configuration.

    const serverConfig = {
      // \`models\` and \`factories\` are POJOs so you can merge generated models and factories
      // with your own e.g. \`models: {...models, { myModel }}\`
      models,
      factories,

      seeds() {},

      routes() {
        // This results in each route handler gets defined like \`this.get('/coffee', getCoffeeHandler)\`;
        handlersMap.forEach((handler: MirageRouteHandler, info: HandlerRequest) => {
          // @ts-expect-error these are known methods
          this[info.verb](info.path, handler);
        });
        // your other route handlers can go here
      }
    }`;

describe("Building server file", () => {
  test('builds a server file', async () => {
    const result = buildServerFile();
    const expectedOutput = await format(exampleServer);
    const input = await format(result);

    expect(input).toBe(expectedOutput);
  });

});