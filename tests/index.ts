import * as di from 'udic';

// Create a service that generates random number
const randNumber = di.service('randNumber')<() => number>();

// Use the service
const computed = di.derive(
  [randNumber],
  (getRandNumber) => getRandNumber() + 1
);

// Create a service that generates random string
const randString = di.service('randString')<() => string>();

// Use the computed value of `computed`
const computed1 = di.derive(
  [randString, computed],
  (getRandString, computedValue) => getRandString() + ': ' + computedValue,
);

console.log(
  // Provide implementations of services
  computed1({
    randNumber: () => Math.random(),
    randString: () => crypto.randomUUID(),
  }),
); // Output: '<random uuid>: <random number + 1>'

console.log(
  computed1({
    randNumber: () => 0,
    randString: () => 'reve'
  })
); // Output: 'reve: 1'
