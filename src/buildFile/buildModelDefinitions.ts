import camelcase from 'camelcase';
import { AutogenComment } from '../utils';

export default function buildModelDefinitionsFile(modelNames: string[]): string {
  const modelDefinitions: string = modelNames.reduce((definitions, modelName) => {
    return definitions + `
      const ${modelName}Model = <ModelDefinition>Model.extend({});`;
  }, '');
  const modelsMap: string = modelNames.reduce((definitions, modelName) => {
    return definitions + `${camelcase(modelName)}: ${modelName}Model,`;
  }, '');

  const file = `
    ${AutogenComment}
    import { Model } from 'miragejs';
    import type { ModelDefinition } from "miragejs/-types";

    ${modelDefinitions}

    export const models = {
      ${modelsMap}
    };`;
  return file;
}