import { expect, test, describe } from 'bun:test';
import buildFactoryFile from '../src/buildFile/buildFactory';
import prettier from 'prettier';
import { AutogenComment, format } from '../src/utils';

const exampleFactory = `${AutogenComment}\nimport { Factory } from 'miragejs';\n\nexport default Factory.extend({\n  valid: true,\n  modifiedDate: '2025-08-15T01:36:34.749Z',\n  nameOnCard: 'Thomas Middlehurst',\n  totalAmountDeposited: 1000,\n  scheme: 'VISA',\n  transactions: ['Buy Groceries', 'Buy Coffee']\n});\n`;

describe('Building a factory file', () => {
  test('writes a factory file for a simple model', async () => {
    const modelName = 'Member';
    const schema = require('./test-specs/schemas/PrimitivesOnlySchema.json');
    const res = await format(buildFactoryFile(modelName, schema));

    expect(res.length).toBeGreaterThan(0);
    expect(typeof res).toEqual("string");
  });

  test('writes a factory file for a model', async () => {
    const modelName = 'Member';
    const schema = require('./test-specs/schemas/PaymentCard.json');
    const res = await format(buildFactoryFile(modelName, schema));

    expect(res.length).toBeGreaterThan(0);
    expect(typeof res).toEqual("string");
  });

  test('writes a factory file for a model with example values', async () => {
    const modelName = 'Member';
    const schema = require('./test-specs/schemas/ComplexSchemaWithExamples.json');
    const res = await format(buildFactoryFile(modelName, schema));
    const formattedRes = await prettier.format(res, {
      semi: true, singleQuote: true, parser: 'typescript', trailingComma: 'none'
    });
    const expected = await prettier.format(exampleFactory, {
      semi: true, singleQuote: true, parser: 'typescript', trailingComma: 'none'
    });

    expect(formattedRes).toEqual(expected);
  });
});