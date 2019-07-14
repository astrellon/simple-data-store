# Benchmarks

Some benchmarks for comparing simple and somewhat complex stores. Also some comparisons with Redux.

To run all benchmarks:

```sh
$ npm run benchmarks
```

## TL;DR

For very simple stores, such as a store that is a simple primitive value, or a state that doesn't require being combined with the previous state (ie: {...state, etc}) Redux is faster, sometimes by a factor of 10x.

However apart from either very trivial examples almost any store state is going to have multiple fields and a reducer or modifier is going to only modify part of it and need to be combined with the previous state, in that case Simple-Data-Store is on par if not slightly faster, but no more 10%.

## Test Rig
```sh
ts-node Version: v8.3.0
CPU: i7 4770K
RAM: 16gb
OS: Ubuntu 18.04 kernel 4.15.0-54-generic
```

## Results

### Simple Benchmark
This compares a simple state that only has one counter field.

Redux is the clear winner for very simple states.

```sh
$ ts-node simpleBenchmark.ts

NoArgModifiers x 1,409,557 ops/sec ±0.61% (94 runs sampled)
ArgModifiers x 1,409,926 ops/sec ±0.51% (92 runs sampled)
NoArgRedux x 5,334,474 ops/sec ±0.58% (91 runs sampled)
ArgRedux x 5,240,403 ops/sec ±0.64% (89 runs sampled)
Fastest is NoArgRedux
```

### Todo Benchmark
This compares a slightly more complex state that simulates a simple Todo app and counter.

SimpleDataStore is faster but only a small amount.

```sh
$ ts-node bigStateBenchmark.ts

SimpleDataStore x 160,359 ops/sec ±0.86% (87 runs sampled)
Redux x 155,919 ops/sec ±0.67% (91 runs sampled)
Fastest is SimpleDataStore
```

### Big State Benchmark
This compares a 'big state' that has 20 number fields each with their own reducer and modifier.

The difference between the two is fairly small.

```sh
$ ts-node todoBenchmark.ts

SimpleDataStore x 5,949 ops/sec ±0.75% (90 runs sampled)
Redux x 5,906 ops/sec ±0.74% (89 runs sampled)
Fastest is SimpleDataStore,Redux
```

## Conclusion
The difference in performance between Redux and SimpleDataStore is pretty minimal for any real world example.

There may be an advantage to SimpleDataStore for a very large number of reducers as there's no scaling issues there where as in Redux some patterns can lead to some issues. But this is a per implementation issue as well.