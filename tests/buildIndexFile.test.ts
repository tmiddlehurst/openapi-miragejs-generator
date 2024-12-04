import { describe, test, expect } from 'bun:test';
import { AutogenComment, format } from '../src/utils';
import buildIndexFile from '../src/buildFile/buildIndexFile';

const expectedIndexFile = `${AutogenComment}
  export * from \'./factories\';
  export * from \'./handlers\';
  export * from \'./models\';
  export * from \'./example-server\'
`;

describe("building index file", () => {
  test('builds index file', async () => {
    const input = await format(buildIndexFile());
    const expected = await format(expectedIndexFile);

    expect(input).toBe(expected);
  });
});