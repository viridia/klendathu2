/** Enumeration representing relationship between linked issues. */
export enum Relation {
  BLOCKED_BY = 'BLOCKED_BY',
  BLOCKS = 'BLOCKS',
  INCLUDED_BY = 'INCLUDED_BY',
  INCLUDES = 'INCLUDES',
  DUPLICATE = 'DUPLICATE',
  RELATED = 'RELATED',
}

// tslint:disable:no-namespace
export namespace Relation {
  export const values = [
    'BLOCKED_BY',
    'BLOCKS',
    'INCLUDED_BY',
    'INCLUDES',
    'DUPLICATE',
    'RELATED',
  ];
}
