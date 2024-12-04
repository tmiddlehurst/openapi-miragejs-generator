import { isPluralOfOtherSchema } from "../src/utils";
import { test, expect } from 'bun:test';

test("isPluralOfOtherSchema", () => {
  const schemas = {
    Pet: {},
    Pets: {},
  };
  const schemaNames = Object.keys(schemas);
  expect(isPluralOfOtherSchema('Pets', schemaNames)).toBe(true);
  expect(isPluralOfOtherSchema('Bats', schemaNames)).toBe(false);
  expect(isPluralOfOtherSchema('Pe', schemaNames)).toBe(false);
  expect(isPluralOfOtherSchema('Pes', schemaNames)).toBe(false);
  expect(isPluralOfOtherSchema('', schemaNames)).toBe(false);
});