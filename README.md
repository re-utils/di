A simple dependency injection library.
```ts
import * as di from 'udic';

const computed = di.compute<
  di.Service<'rand', number> | di.Service<'rand1', number>
>()((c) => c.rand * c.rand1 + 1);

const computed1 = di.compute<typeof computed | di.Service<'rand2', number>>()(
  (c) => computed(c)() / c.rand2,
);

console.log(
  computed1({
    rand: 9,
  })({
    rand1: 10,
  })({
    rand2: 11,
  })(),
);
```
