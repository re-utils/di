// Hide internal types
const _t: unique symbol = Symbol();
declare const _d: unique symbol;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface Service<in out T extends string | symbol, in out K> {
  [_t]: K;
  [_d]: undefined extends K ? { [k in T]?: K } : { [k in T]: K };
}

export interface Compute<in out T, in out R> {
  [_t]: R;
  [_d]: T;
  (c: T): R;
}

export type Dependency = Service<any, any> | Compute<any, any>;

export type InferResult<T extends Dependency> = T[typeof _t];
export type InferDependency<T extends Dependency> = Prettify<
  UnionToIntersection<T[typeof _d]>
>;

/**
 * Create a service
 * @param name - The service name
 */
export const service =
  <T extends string | symbol>(name: T): (<K>() => Service<T, K> & T) =>
  () =>
    name as any;

// @ts-ignore
const tag = <const T>(f: T): T => (f[_t] = Symbol(), f);

/**
 * Create a compute that relies on other services or computes
 * @param deps - The service dependencies
 * @param f
 */
export const derive = <const T extends Dependency[], const R>(
  deps: T,
  f: (
    ...args: {
      [K in keyof T]: InferResult<T[K]>;
    }
  ) => R,
): Compute<InferDependency<T[number]>, R> =>
  // @ts-ignore
  tag((c) =>
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
): Compute<Prettify<Omit<T, keyof D>>, R> =>
  tag((c: any) => compute({ ...c, ...d })) as any;
