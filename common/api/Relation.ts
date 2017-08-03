/** Enumeration representing relationship between linked issues. */
export enum Relation {
  BLOCKED_BY = 'blocked-by',
  BLOCKS = 'blocks',
  INCLUDED_BY = 'included-by',
  INCLUDES = 'includes',
  DUPLICATE = 'duplicate',
  RELATED = 'related',
}

console.log(JSON.stringify(Relation, null, 2));

// tslint:disable:no-namespace
export namespace Relation {
  export const values = [
    'blocked-by',
    'blocks',
    'included-by',
    'includes',
    'duplicate',
    'related',
  ];
}
