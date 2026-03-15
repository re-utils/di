type ObjectUnionToIntersect<T> = { [K in T as K & string]: K }[any];

export type ContextArgs =
  | { [key: string | symbol]: any }
  | ((...args: any[]) => any);
export type Context<Deps extends ContextArgs> = ObjectUnionToIntersect<
  Deps extends (() => infer Out extends {})
    ? Awaited<Out>
    : Deps extends ((c: infer In extends {}) => infer Out extends {})
      ? In & Awaited<Out>
      : Deps extends (c: infer C, ...args: any[]) => any
        ? C
        : Deps
>;

export interface Impl {
  <const Out extends ContextArgs>(
    fn: (c: {}) => Context<Out>,
  ): (c: {}) => Context<Out>;

  <const In extends ContextArgs, const Out extends ContextArgs>(
    fn: (c: Context<In>) => Context<Out>,
  ): (c: Context<In>) => Context<Out>;
}

/**
 * Create a sync implementation of a dependency.
 */
export const impl: Impl = (fn: any) => fn;

export interface ImplAsync {
  <const Out extends ContextArgs>(
    fn: (c: {}) => Context<Out> | Promise<Context<Out>>,
  ): (c: {}) => Context<Out> | Promise<Context<Out>>;

  <const In extends ContextArgs, const Out extends ContextArgs>(
    fn: (c: Context<In>) => Context<Out> | Promise<Context<Out>>,
  ): (c: Context<In>) => Context<Out> | Promise<Context<Out>>;
}

/**
 * Create an async implementation of a dependency.
 */
export const implAsync: ImplAsync = (fn: any) => fn;

type _ImplFn = (() => {} | Promise<{}>) | ((c: any) => {} | Promise<{}>);
type _ImplFns = [_ImplFn, ..._ImplFn[]];

interface Link {
  <const In extends {}, Impls extends _ImplFns>(
    c: In,
    ...impls: Impls
  ): Context<Impls[number]>
}

/**
 * Link sync implementations.
 */
export const link: Link = (c, ...impls) => {
  for (let i = 0; i < impls.length; i++) Object.assign(c, impls[i](c));
  return c as any;
};

/**
 * Link async implementations concurrently.
 */
export const linkAsync: Link = async (c, ...impls) => {
  if (impls.length === 1) return Object.assign(c, await impls[0](c));

  const arr = new Array<{}>(impls.length);
  for (let i = 0; i < impls.length; i++) arr[i] = impls[i](c);
  return Object.assign(c, ...await Promise.all(arr));
};
