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

export interface Service<in out K extends string, in out T> {
  [_t]: T;
  [_d]: undefined extends T ? { [k in K]?: T } : { [k in K]: T };
}

export interface Compute<in out T, in out R> {
  [_t]: R;
  [_d]: T;
  (c: T): R;
}

export interface Layer<
  in out K extends string,
  in out D,
  in out R
> {
  [_t]: { [k in K]: R }
  [_d]: D
}

export type InferResult<T extends { [_t]: any }> = T[typeof _t];
export type InferDependency<T extends { [_d]: any }> = Prettify<
  UnionToIntersection<T[typeof _d]>
>;

/**
 * Create a service
 * @param name - The service name
 */
export const service =
  <const T extends string>(name: T): (<K>() => Service<T, K> & T) =>
  () =>
    name as any;

// @ts-ignore
const tag = <const T>(f: T): T => ((f[_t] = Symbol()), f);

/**
 * Create a compute that relies on other services or computes
 * @param deps - The service dependencies
 * @param f
 */
export const derive = <const T extends (Service<any, any> | Compute<any, any>)[], R>(
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

export const layer = <K extends string, T, D>(
  service: Service<K, T>,
  compute: Compute<D, T>,
): Layer<K, D, T> => [service as any as K, compute] as any;

export const provide = <
  const T extends Layer<any, any, any>[],
  D extends InferDependency<T[number]>,
>(
  layers: T,
  deps: D,
): Prettify<D & InferResult<T[number]>> => {
  for (let i = 0; i < layers.length; i++)
    // @ts-ignore
    deps[layers[i][0]] = layers[i][1](deps);
  return deps as any;
}
