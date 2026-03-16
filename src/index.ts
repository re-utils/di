type ObjectUnionToIntersect<T> = { [K in T as K & string]: K }[any];

export type ContextArgs =
  | { [key: string | symbol]: any }
  | ((...args: any[]) => any);
export type Context<Deps extends ContextArgs> = ObjectUnionToIntersect<
  Deps extends ImplTag<any, any>
    ? Deps['~infer']
    : Deps extends (c: infer C, ...args: any[]) => any
      ? C
      : Deps
>;

export interface ImplTag<out In, out Out> {
  '~in': In;
  '~infer': In & Out;
}

export interface SyncImplTag<out In, out Out> extends ImplTag<In, Out> {
  '~sync': 1;
}

export interface Impl {
  <const F extends (...args: any[]) => any>(
    fn: F,
  ): F &
    (
      F extends (() => infer Out extends {})
      ? SyncImplTag<{}, Out>
      : F extends ((c: infer In extends {}) => infer Out extends {})
        ? SyncImplTag<In, Out>
        : never
    );

  <const Out extends ContextArgs>(
    fn: (c: {}) => Context<Out>,
  ): ((c: {}) => Context<Out>) & SyncImplTag<{}, Context<Out>>;

  <const In extends ContextArgs, const Out extends ContextArgs>(
    fn: (c: Context<In>) => Context<Out>,
  ): ((c: Context<In>) => Context<Out>) &
    SyncImplTag<Context<In>, Context<Out>>;
}

/**
 * Create a sync implementation of a dependency.
 */
export const impl: Impl = (fn: any) => fn;

export interface ImplAsync {
  <const F extends (...args: any[]) => any>(
    fn: F,
  ): F &
    (F extends (() => infer Out extends {} | Promise<{}>)
      ? ImplTag<{}, Awaited<Out>>
      : F extends ((
            c: infer In extends {},
          ) => infer Out extends {} | Promise<{}>)
        ? ImplTag<In, Awaited<Out>>
        : never);

  <const Out extends ContextArgs>(
    fn: (c: {}) => Context<Out> | Promise<Context<Out>>,
  ): ((c: {}) => Context<Out>) & ImplTag<{}, Context<Out>>;

  <const In extends ContextArgs, const Out extends ContextArgs>(
    fn: (c: Context<In>) => Context<Out> | Promise<Context<Out>>,
  ): ((c: Context<In>) => Context<Out> | Promise<Context<Out>>) &
    ImplTag<Context<In>, Context<Out>>;
}

/**
 * Create an async implementation of a dependency.
 */
export const implAsync: ImplAsync = impl as any;

/**
 * Link sync implementations.
 */
export const link: <
  Impls extends [SyncImplTag<any, any>, ...SyncImplTag<any, any>[]],
  const In extends ObjectUnionToIntersect<Impls[number]['~in']>,
>(
  c: In,
  ...impls: Impls
) => In & Context<Impls[number]> = (c, ...impls) => {
  for (let i = 0; i < impls.length; i++)
    Object.assign(
      c,
      // @ts-ignore
      impls[i](c),
    );
  return c as any;
};

/**
 * Link async implementations concurrently.
 */
export const linkAsync: <
  Impls extends [ImplTag<any, any>, ...ImplTag<any, any>[]],
  const In extends ObjectUnionToIntersect<Impls[number]['~in']>,
>(
  c: In,
  ...impls: Impls
) => Promise<In & Context<Impls[number]>> = async (c, ...impls) => {
  if (impls.length === 1)
    return Object.assign(
      c,
      // @ts-ignore
      await impls[0](c),
    );

  const arr = new Array<{}>(impls.length);
  for (let i = 0; i < impls.length; i++)
    // @ts-ignore
    arr[i] = impls[i](c);
  return Object.assign(c, ...(await Promise.all(arr)));
};
