declare const tag: unique symbol;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

export interface Service<T extends string | symbol, K> {
  0: K;
  1: K extends undefined ? { [k in T]?: K } : { [k in T]: K };
  readonly [tag]: null;
}

export interface Compute<T extends Dependency[], R> {
  (args: InferRecord<T>): R;
  0: R;
  1: InferRecord<T>;
  readonly [tag]: null;
}

export type AnyService = Service<string | symbol, any>;
export type AnyCompute = Compute<any[], any>;
export type Dependency = AnyService | AnyCompute;

export type InferDependencies<T extends Dependency[]> = {
  [K in keyof T]: T[K][0];
};

export type InferRecord<T extends Dependency[]> = UnionToIntersection<
  T[number][1]
>;

export const service =
  <T extends string | symbol>(t: T): (<K>() => Service<T, K>) =>
  () =>
    t as any;

export const compute =
  <const T extends Dependency[], const R>(
    f: (...args: InferDependencies<NoInfer<T>>) => R,
    ...deps: T
  ): Compute<T, R> =>
  // @ts-ignore
  (c) =>
    f(
      // @ts-ignore
      ...deps.map((d) =>
        // @ts-ignore
        typeof d === "function" ? (c[d] ??= d(c)) : c[d],
      ),
    );
