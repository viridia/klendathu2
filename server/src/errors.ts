// tslint:disable:max-classes-per-file
/** Enum that is used on the client to determine what message to display. */
export enum ErrorKind {
  NETWORK = 'network',
  NOT_FOUND = 'not-found',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  INTERNAL = 'internal',
  NOT_IMPLEMENTED = 'not-implemented',
  NAME_TOO_SHORT = 'name-too-short',
  INVALID_NAME = 'invalid-name',
  NAME_EXISTS = 'name-exists',
  MISSING_FIELD = 'missing-field',
  NO_ADMINS = 'no-admins',
  INVALID_PREDICATE = 'invalid-predicate',
  INVALID_LINK = 'invalid-link',
  INVALID_SORT_KEY = 'invalid-sort-key',
  // MISSING_PASSWORD = 'missing-password',
  // INVALID_PASSWORD = 'invalid-password',
  // INCORRECT_PASSWORD = 'incorrect-password',
  // DUPLICATE_USERNAME = 'duplicate-username',
  // MISSING_PARENT = 'missing-parent',
  // DUPLICATE_NAME = 'duplicate-name',
}

/** Base class for errors. */
export class ResolverError extends Error {
  public readonly kind: ErrorKind;
  public readonly details?: any;

  constructor(kind: ErrorKind, details?: any) {
    super();
    this.kind = kind;
    this.details = details;
  }
}

export class NetworkError extends ResolverError {
  constructor(details?: any) {
    super(ErrorKind.NETWORK, details);
  }
}

export class Unauthorized extends ResolverError {
  constructor(details?: any) {
    super(ErrorKind.UNAUTHORIZED, details);
  }
}

export class Forbidden extends ResolverError {
  constructor(details?: any) {
    super(ErrorKind.FORBIDDEN, details);
  }
}

export class NotFound extends ResolverError {
  constructor(details?: any) {
    super(ErrorKind.NOT_FOUND, details);
  }
}

export class InternalError extends ResolverError {
  constructor(details?: any) {
    super(ErrorKind.INTERNAL, details);
  }
}

export class NotImplemented extends ResolverError {
  constructor(details?: any) {
    super(ErrorKind.NOT_IMPLEMENTED, details);
  }
}
