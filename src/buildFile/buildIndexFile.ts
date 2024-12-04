import { AutogenComment } from '../utils';

export default function () {
  return `${AutogenComment}
  export * from \'./factories\';
  export * from \'./handlers\';
  export * from \'./models\';
  export * from \'./example-server\'
  `;
}