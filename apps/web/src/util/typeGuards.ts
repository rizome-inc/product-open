export function isNotNull<T>(x: T | null): x is T {
  return x !== null;
}

export function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export function isType<T>(x: T | null | undefined): x is T {
  return x !== undefined && x !== null;
}
