A dependency injection library.
```ts
import * as di from 'udic';
```

# Examples
Run code that depends on a service:
```ts
// Create a service that generates random number
const randNumber = di.service('randNumber')<() => number>();

// Use the service
const compute = di.derive(
  [randNumber],
  (getRandNumber) => getRandNumber() + 1
);

// 1
console.log(
  compute({ randNumber: () => 0 })
);
```

Nested `derive()`:
```ts
// Create a service that generates random number
const randNumber = di.service('randNumber')<() => number>();

// Use the service
const compute = di.derive(
  [randNumber],
  (getRandNumber) => getRandNumber() + 1
);

// Use `compute()` within current context
const anotherCompute = di.derive(
  [compute],
  (computedValue) => computedValue * 2
);

// 2
console.log(
  anotherCompute({ randNumber: () => 0 })
);
```

Multiple dependencies:
```ts
// Create a service that generates random number
const randNumber = di.service('randNumber')<() => number>();

// Use the service
const computeNumber = di.derive(
  [randNumber],
  (getRandNumber) => getRandNumber() + 1,
);

// Create a service that generates random string
const randString = di.service('randString')<() => string>();

// Use the computed value of `computed`
const computeString = di.derive(
  [randString, computeNumber],
  (getRandString, number) => getRandString() + ': ' + number,
);

// 'reve: 1'
console.log(
  computeString({
    randNumber: () => 0,
    randString: () => 'reve',
  }),
);
```

Inject not all dependencies:
```ts
// Create a service that generates random number
const randNumber = di.service('randNumber')<() => number>();

// Use the service
const computeNumber = di.derive(
  [randNumber],
  (getRandNumber) => getRandNumber() + 1,
);

// Create a service that generates random string
const randString = di.service('randString')<() => string>();

// Use the computed value of `computed`
const computeString = di.derive(
  [randString, computeNumber],
  (getRandString, number) => getRandString() + ': ' + number,
);

// Inject the randNumber service
const computeString1 = di.inject(computeString, {
  randNumber: () => 0
});

// 'reve: 1'
console.log(
  computeString1({
    randString: () => 'reve',
  }),
);
```
