type ObjectUnionToIntersect<T> = { [K in T as K & string]: K }[any];

export type ContextArgs =
  | { [key: string | symbol]: any }
  | ((c: {}, ...args: any[]) => any)
  | Impl;
export type Context<Deps extends ContextArgs> = ObjectUnionToIntersect<
  Deps extends Impl
    ? Awaited<Deps['infer']>
    : Deps extends (c: infer C, ...args: any[]) => any
      ? C
      : Deps
>;

export interface Impl<in In = any, out Out extends {} = {}> {
  infer: Out;
  (c: In): Out;
}

export interface ImplFn {
  <const F extends () => {}>(
    fn: F,
  ): F extends (() => infer Out extends {}) ? Impl<{}, Out> : never;

  <const F extends (c: any) => {}>(
    fn: F,
  ): F extends ((c: infer In) => infer Out extends {}) ? Impl<In, Out> : never;

  <const Out extends ContextArgs>(
    fn: (c: {}) => Context<Out>,
  ): Impl<{}, Context<Out>>;

  <const In extends ContextArgs, const Out extends ContextArgs>(
    fn: (c: Context<In>) => Context<Out>,
  ): Impl<Context<In>, Context<Out>>;
}

/**
 * Create a sync implementation of a dependency.
 */
export const impl: ImplFn = (fn: any) => fn;

export interface ImplAsyncFn {
  <const F extends () => Promise<{}>>(
    fn: F,
  ): F extends (() => infer Out extends {}) ? Impl<{}, Out> : never;

  <const F extends (c: any) => Promise<{}>>(
    fn: F,
  ): F extends ((c: infer In) => infer Out extends {}) ? Impl<In, Out> : never;

  <const Out extends ContextArgs>(
    fn: (c: {}) => Promise<Context<Out>>,
  ): Impl<{}, Promise<Context<Out>>>;

  <const In extends ContextArgs, const Out extends ContextArgs>(
    fn: (c: Context<In>) => Promise<Context<Out>>,
  ): Impl<Context<In>, Promise<Context<Out>>>;
}

/**
 * Create an async implementation of a dependency.
 */
export const implAsync: ImplAsyncFn = (fn: any) => fn;

/**
 * Link sync implementations.
 */
export const link: <
  const In extends {},
  Impls extends [Impl<In, any>, ...Impl<In, any>[]],
>(
  c: In,
  ...impls: Impls
) => In & ReturnType<Impls[number]> = (c, firstImpl, ...impls) => {
  c = Object.assign(firstImpl(c), c);
  for (let i = 0; i < impls.length; i++) Object.assign(c, impls[i](c));
  return c as any;
};

/**
 * Link async implementations concurrently.
 */
export const linkAsync: <
  const In extends {},
  Impls extends [Impl<In, any>, ...Impl<In, any>[]],
>(
  c: In,
  ...impls: Impls
) => Promise<In & Awaited<ReturnType<Impls[number]>>> = async (c, ...impls) => {
  if (impls.length === 1) return Object.assign(await impls[0](c), c);

  const arr = new Array<{}>(impls.length);
  for (let i = 0; i < impls.length; i++) arr[i] = impls[i](c);
  return Object.assign(...((await Promise.all(arr)) as [any, ...any[]]), c);
};
