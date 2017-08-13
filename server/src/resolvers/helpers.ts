import { FieldNode } from 'graphql';

export function selectedFields(options: { fieldNodes: FieldNode[] }): Set<string> {
  const result = new Set<string>();
  if (options.fieldNodes) {
    for (const f of options.fieldNodes) {
      if (f.selectionSet) {
        for (const s of f.selectionSet.selections) {
          if (s.kind === 'Field') {
            result.add(s.name.value);
          }
        }
      }
    }
  }
  return result;
}
