// Inform typescript about .svg and .graphql imports
declare module 'icons/*.svg' {
  const _: string;
  export default _;
}
declare module '*.graphql' {
  const _: any;
  export default _;
}
