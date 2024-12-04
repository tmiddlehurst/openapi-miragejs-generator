import { expect, test, describe } from 'bun:test';
import type { OpenAPIV3 } from 'openapi-types';
import getHandlersFromPaths, { getHandlerName, type HandlerConfig } from '../src/getRouteHandlerConfig';

describe('Gets config for route handlers', () => {

  test('Gets handler names and verbs from path object', () => {
    const pathsObject = require('./test-specs/paths/CRUD-api-no-refs.json');

    const expected: HandlerConfig[] = [{ name: 'getCatByIdHandler', method: 'get', path: '/cats/{catId}' }, { name: 'updateCatByIdHandler', method: 'put', path: '/cats/{catId}' }, { name: 'deleteCatByIdHandler', method: 'delete', path: '/cats/{catId}' }];
    expect(getHandlersFromPaths(pathsObject.paths)).toEqual(expected);
  });

  test('uses operationId as handler name if present', () => {
    expect(getHandlerName('/members', 'get', { "operationId": "getCats", } as OpenAPIV3.OperationObject)).toEqual('getCatsHandler');
    expect(getHandlerName('/members', 'get', { "operationId": "get-cats", } as OpenAPIV3.OperationObject)).toEqual('getCatsHandler');
  });

  test('uses path and http method as handler name if operationId is not present', () => {
    expect(getHandlerName('/admin/members/feeClass', 'get', { "tags": ["Cat"] } as OpenAPIV3.OperationObject)).toEqual('getMembersFeeClassHandler');
    expect(getHandlerName('long/path/name/admin/members/feeClass', 'get', { "tags": ["Cat"] } as OpenAPIV3.OperationObject)).toEqual('getMembersFeeClassHandler');
    expect(getHandlerName('long/path/name/admin/members/feeClass', 'put', { "tags": ["Cat"] } as OpenAPIV3.OperationObject)).toEqual('updateMembersFeeClassHandler');
    expect(getHandlerName('long/path/name/admin/members/feeClass', 'patch', { "tags": ["Cat"] } as OpenAPIV3.OperationObject)).toEqual('updateMembersFeeClassHandler');
    expect(getHandlerName('long/path/name/admin/members/feeClass', 'post', { "tags": ["Cat"] } as OpenAPIV3.OperationObject)).toEqual('addMembersFeeClassHandler');
    expect(getHandlerName('long/path/name/admin/members/feeClass', 'delete', { "tags": ["Cat"] } as OpenAPIV3.OperationObject)).toEqual('deleteMembersFeeClassHandler');
    expect(getHandlerName('/admin/members/feeClass/{feeClassId}', 'get', { "tags": ["Cat"] } as OpenAPIV3.OperationObject)).toEqual('getMembersFeeClassHandler');
    expect(getHandlerName('/members', 'get', { "tags": ["Cat"] } as OpenAPIV3.OperationObject)).toEqual('getMembersHandler');
    expect(getHandlerName('/members/{feeClassId}', 'get', { "tags": ["Cat"] } as OpenAPIV3.OperationObject)).toEqual('getMembersHandler');
    expect(getHandlerName('/members/fee-class', 'get', { "tags": ["Cat"] } as OpenAPIV3.OperationObject)).toEqual('getMembersFeeClassHandler');
    expect(getHandlerName('/', 'get', { "tags": ["Cat"] } as OpenAPIV3.OperationObject)).toEqual('getHandler');
  });

});