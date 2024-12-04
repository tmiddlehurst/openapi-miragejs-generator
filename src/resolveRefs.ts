import type { OpenAPIV3 } from 'openapi-types';

/**
 * Iterate through all keys of object `object` once,
 * recursively call again if any object is found
 * for any key named `$ref`, replace its value with the value at the path.
 * Return count of `$ref`s found.
 */
function recursiveReplace(baseObject: Record<string, any>, current?: Record<string, any>): number {
  let refsFound = 0;
  current = current || baseObject;
  for (const key in current) {
    if (typeof current[key] === 'object') {
      if (!Array.isArray(current[key])) {
        recursiveReplace(baseObject, current[key]);
      } else {
        if (current[key][0] && typeof current[key][0] === 'object') {
          current[key].forEach((element: Record<string, any>) => recursiveReplace(baseObject, element));
        }
      }
    } else {
      if (key === '$ref') {
        refsFound += 1;
        // Supports local references only
        // We can assume this is true since the input spec has been passed through `redocly bundle`
        // https://redocly.com/docs/cli/commands/bundle
        if (current[key].startsWith('#/')) {
          const pathSegments = current[key].split('#/')[1].split('/');
          const propsFromRef = getWithNestedPath(baseObject, pathSegments);
          delete current[key];

          for (const key in propsFromRef) {
            current[key] = propsFromRef[key];
          }
        }
      }
    }
  }
  return refsFound;
}

/**
 * Given "nestedPath" as `pathSegments`, return value from `object` at a "nestedPath"
 */
export function getWithNestedPath(object: Record<string, any>, pathSegments: string[]): any {
  while (pathSegments.length > 0) {
    const key = pathSegments[0];
    object = object[key];
    pathSegments.shift();
  }
  return object;
}

export default function resolveRefs(doc: OpenAPIV3.Document): OpenAPIV3.Document {
  const refs = recursiveReplace(doc);
  doc = refs === 0 ? doc : resolveRefs(doc);
  return doc;
}