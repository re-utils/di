import { test, expect } from 'bun:test';
import * as di from 'udic';

test('One dependency', () => {
  // Create a service that generates random number
  const randNumber = di.service('randNumber')<() => number>();

  // Use the service
  const compute = di.derive(
    [randNumber],
    (getRandNumber) => getRandNumber() + 1,
  );

  expect(compute({ randNumber: () => 0 })).toBe(1);
});

test('Nested dependencies', () => {
  // Create a service that generates random number
  const randNumber = di.service('randNumber')<() => number>();

  // Use the service
  const compute = di.derive(
    [randNumber],
    (getRandNumber) => getRandNumber() + 1,
  );

  // Use `compute()` within current context
  const anotherCompute = di.derive(
    [compute],
    (computedValue) => computedValue * 2,
  );

  expect(anotherCompute({ randNumber: () => 0 })).toBe(2);
});

test('Multiple dependencies', () => {
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

  expect(
    computeString({
      randNumber: () => 0,
      randString: () => 'reve',
    }),
  ).toBe('reve: 1');
});

test('Inject not all dependencies', () => {
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
    randNumber: () => 0,
  });

  expect(
    computeString1({
      randString: () => 'reve',
    }),
  ).toBe('reve: 1');
});
