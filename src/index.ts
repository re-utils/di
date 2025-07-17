const _t: unique symbol = Symbol();
declare const _d: unique symbol;

// Utils
type UnionToIntersect<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;
type UnwrapReturn<T> = T extends () => infer R ? R : T;
type Evaluate<T> = {
  [K in keyof T]: T[K];
} & {};
type List<T> = [T, ...T[]];

export type Dependency = (() => Service) | Compute;

// Inter types
export type TDependency<T extends Dependency | Impl> = UnionToIntersect<
  UnwrapReturn<T>[typeof _d]
>;
export type TResult<T extends Dependency | Impl> = UnwrapReturn<T>[typeof _t];

export interface Service<in out K extends string = any, in out T = any> {
  [_t]: T;
  [_d]: undefined extends T ? { [k in K]?: T } : { [k in K]: T };
}
export interface Compute<in out T = any, in out R = any> {
  [_t]: R;
  [_d]: T;
  (c: T): R;
}
export interface Impl<
  in out K extends string = any,
  in out D = any,
  in out R = any,
> {
  [_t]: { [k in K]: R };
  [_d]: D;
}

/**
 * Create a service
 * @param name - The service name
 */
export const service =
  // Type hack: Assign type without needing a runtime call
  <const T extends string>(name: T): (<K>() => Service<T, K>) => name as any;

// @ts-ignore
const _ = <const T>(f: T): T => ((f[_t] = Symbol()), f);

/**
 * Create a compute that relies on other services or computes
 * @param deps - The service dependencies
 * @param f
 */
export const use = <
  const T extends List<Dependency>,
  R,
>(
  deps: T,
  f: (
    ...args: {
      [K in keyof T]: TResult<T[K]>;
    }
  ) => R,
): Compute<TDependency<T[number]>, R> =>
  // @ts-ignore
  _((c) =>
    f(
      // @ts-ignore
      ...deps.map((d: any) =>
        // @ts-ignore
        typeof d === 'function' ? (c[d[_t]] ??= d(c)) : c[d],
      ),
    ),
  );

/**
 * Inject dependencies to the compute
 * @param compute
 * @param deps - Dependencies to inject
 */
export const inject = <T, R, D extends Partial<T>>(
  compute: Compute<T, R>,
  d: D,
): Compute<Evaluate<Omit<T, keyof D>>, R> =>
  _((c: any) => compute({ ...c, ...d })) as any;

/**
 * Create an implementation of the service that depends on other services
 * @param service
 * @param compute
 */
export const impl = <K extends string, T, D>(
  service: () => Service<K, T>,
  compute: Compute<D, T>,
): Impl<K, D, T> => [service as any, compute] as any;

/**
 * Provide dependencies to implementations
 * @param impls
 * @param deps
 */
export const link = <
  const T extends List<Impl>,
  D extends TDependency<T[number]>,
>(
  impls: T,
  deps: D,
): Evaluate<D & UnionToIntersect<TResult<T[number]>>> => {
  deps = { ...(deps as any) };
  for (let i = 0; i < impls.length; i++)
    // @ts-ignore
    deps[impls[i][0]] = impls[i][1](deps);
  return deps as any;
};
