import { describe, test, expect } from 'bun:test';
import { AutogenComment, format } from '../src/utils';
import buildMirageTypes from '../src/buildFile/buildMirageTypes';

const expected = `${AutogenComment}
import { Registry } from 'miragejs';
import Schema from 'miragejs/orm/schema'; // eslint-disable-line
import { factories } from './factories';
import { models } from './models';

export type AppRegistry = Registry<typeof models, typeof factories>
export type AppSchema = Schema<AppRegistry>
`;

describe('building mirage type definitions', () => {
  test('writes type definitions file', async () => {
    const buildResult = await buildMirageTypes();
    const expectedOutput = await format(expected);
    const input = await format(buildResult);

    expect(input).toBe(expectedOutput);
  });
});
