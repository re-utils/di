import { di } from "udic";

const rand = di.service("rand")<number>();
const computed = di.compute((val) => val + 1, rand);

const rand1 = di.service("rand1")<number>();
const computed1 = di.compute(
  (val, computed0) => val + computed0,
  rand1,
  computed,
);

console.log(
  computed1({
    rand: 9,
    rand1: 9,
  }),
);
