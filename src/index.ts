declare const _: unique symbol;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

export interface Service<T extends string | symbol, in out K> {
  0: K;
  [_]: undefined extends K ? { [k in T]?: K } : { [k in T]: K };
}

export interface Compute<in out T extends Dependency[], in out R> {
  (args: InferRecord<T>): R;
  0: R;
  [_]: InferRecord<T>;
}

export type AnyService = Service<string | symbol, any>;
export type AnyCompute = Compute<any[], any>;
export type Dependency = AnyService | AnyCompute;

export type InferDependencies<T extends Dependency[]> = {
  [K in keyof T]: T[K][0];
};

export type InferRecord<T extends Dependency[]> = UnionToIntersection<
  T[number][typeof _]
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
  ): Compute<T, R> =>
  // @ts-ignore
  (c) =>
    // @ts-ignore
    f(...deps.map(
      (d: any) =>
        // @ts-ignore
        typeof d === 'function' ? (c[d] ??= d(c)) : c[d]
    ));
