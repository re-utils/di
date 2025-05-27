export interface Service<T extends string | symbol, K> {
  0: K;
  1: K extends undefined ? { [k in T]?: K } : { [k in T]: K };
}

export interface Compute<T extends Dependency[], R> {
  (args: InferDependenciesRecord<T>): R;
  0: R;
  1: InferDependenciesRecord<T>;
}

export type AnyService = Service<string | symbol, any>;
export type AnyCompute = Compute<any[], any>;
export type Dependency = AnyService | AnyCompute;

export type InferDependencies<T extends Dependency[]> = T extends [
  infer A extends Dependency,
  ...infer B extends Dependency[],
]
  ? [A[0], ...InferDependencies<B>]
  : [];

export type InferDependenciesRecord<T extends Dependency[]> = T extends [
  infer A extends Dependency,
  ...infer B extends Dependency[],
]
  ? A[1] & InferDependenciesRecord<B>
  : {};

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
