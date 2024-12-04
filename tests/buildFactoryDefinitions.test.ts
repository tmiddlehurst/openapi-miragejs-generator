import buildFactoryDefinitionsFile from '../src/buildFile/buildFactoryDefinitions';
import { describe, test, expect } from 'bun:test';
import { AutogenComment, format } from '../src/utils';

const exampleFactoriesFile = `${AutogenComment}
import PetFactory from './factories/Pet';
import UserAccountFactory from './factories/UserAccount';

export const factories = {
  pet: PetFactory,
  userAccount: UserAccountFactory
};`;

describe("building factory definitions", () => {
  test('writes factory definitions file from modelNames', async () => {
    const modelNames = ['Pet', 'UserAccount'];
    const buildResult = await buildFactoryDefinitionsFile(modelNames);
    const expectedOutput = await format(exampleFactoriesFile);
    const input = await format(buildResult);

    expect(input).toBe(expectedOutput);
  });
});