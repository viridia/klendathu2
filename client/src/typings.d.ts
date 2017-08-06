// Inform typescript about .svg and .graphql imports
declare module 'icons/*.svg' {
  const _: string;
  export default _;
}
declare module '*.graphql' {
  import { DocumentNode } from 'graphql';
  const value: DocumentNode;
  export = value;
  // export default value;
}
