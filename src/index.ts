declare const _: unique symbol;
type _ = typeof _;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

export interface Service<T extends string | symbol, in out K> {
  0: K;
  [_]: undefined extends K ? { [k in T]?: K } : { [k in T]: K };
}

export interface Compute<in out T, in out R> {
  (c: T): R;
  0: R;
  [_]: T;
}

export type AnyService = Service<string | symbol, any>;
export type AnyCompute = Compute<any, any>;
export type Dependency = AnyService | AnyCompute;

export type InferDependencies<T extends Dependency[]> = {
  [K in keyof T]: T[K][0];
};

export type InferRecord<T extends Dependency[]> = UnionToIntersection<
  T[number][_]
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
    f: (...args: InferDependencies<T>) => R,
  ): Compute<InferRecord<T>, R> =>
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
export const inject = <T extends AnyCompute, D extends Partial<T[_]>>(
  compute: T,
  d: D,
): Compute<Omit<T[_], keyof D>, T[0]> =>
  ((c: any) => compute({ ...c, ...d })) as any;
