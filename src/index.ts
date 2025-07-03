declare const _: unique symbol;
type _ = typeof _;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface Service<in out T extends string | symbol, in out K> {
  0: K;
  [_]: undefined extends K ? { [k in T]?: K } : { [k in T]: K };
}

export interface Compute<in out T, in out R> {
  (c: T): R;
  0: R;
  [_]: T;
}

export type Dependency = Service<any, any> | Compute<any, any>;
export type InferDependencies<T extends Dependency> = Prettify<
  UnionToIntersection<T[_]>
>;

/**
 * Create a service
 * @param name - The service name
 */
export const service =
  <T extends string | symbol>(name: T): (<K>() => Service<T, K>) =>
  () =>
    name as any;

/**
 * Create a service that relies on other services
 * @param deps - The service dependencies
 * @param f
 */
export const derive =
  <const T extends Dependency[], const R>(
    deps: T,
    f: (
      ...args: {
        [K in keyof T]: T[K][0];
      }
    ) => R,
  ): Compute<InferDependencies<T[number]>, R> =>
  // @ts-ignore
  (c) =>
    f(
      // @ts-ignore
      ...deps.map((d: any) =>
        // @ts-ignore
        typeof d === 'function' ? (c[d] ??= d(c)) : c[d],
      ),
    );

/**
 * Inject some dependencies to the compute
 * @param compute
 * @param deps - Dependencies to inject
 */
export const inject = <T, R, D extends Partial<T>>(
  compute: Compute<T, R>,
  d: D,
): Compute<Prettify<Omit<T, keyof D>>, R> =>
  ((c: any) => compute({ ...c, ...d })) as any;
