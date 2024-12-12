import { AutogenComment } from '../utils';

export default function buildMirageTypes() {
  return `${AutogenComment}
import { Registry } from 'miragejs';
import Schema from 'miragejs/orm/schema'; // eslint-disable-line
import { factories } from './factories';
import { models } from './models';

export type AppRegistry = Registry<typeof models, typeof factories>
export type AppSchema = Schema<AppRegistry>
`;
}