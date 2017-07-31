export enum Role {
  NONE = 0,
  VIEWER = 10,
  REPORTER = 25,
  UPDATER = 40,
  DEVELOPER = 55,
  MANAGER = 70,
  ADMINISTRATOR = 100,
}

/** Return the list of [level, name] pairs in sorted order. */
// export function roles() {
//   const result = Object.keys(Role).map(name => [Role[name], name]);
//   result.sort();
//   return result;
// }
