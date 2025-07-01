declare const _: unique symbol;
type _ = typeof _;

export type Service<K extends string | symbol, V> = K & {
  [_]: undefined extends K
    ? {
        [k in K]?: undefined;
      }
    : { [k in K]: V };
};
export type Func<Required, R> = (keyof Required extends never
  ? () => R
  : <Props extends Partial<Required>>(
      deps: Props,
    ) => Func<Omit<Required, keyof Props>, R>) & { [_]: Required };

export type Dependency = Service<string | symbol, any> | Func<any, any>;

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;
export type InferProps<T extends Dependency> = UnionToIntersection<T[_]>;

const factory = (f: any) => {
  const curry = (prev: any, deps: any) =>
    deps == null ? f(prev as any) : (d: any) => curry({ ...deps, ...prev }, d);
  return (d: any) => curry({}, d);
};

export const compute = <T extends Dependency>(): (<const R>(
  fn: (c: InferProps<T>) => R,
) => Func<InferProps<T>, R>) => factory as any;
