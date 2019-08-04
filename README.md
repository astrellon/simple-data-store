# Simple Data Store
![NPM](https://badgen.net/npm/v/simple-data-store)![Badge for Gzip size](https://badgen.net/bundlephobia/minzip/simple-data-store)

A Typescript based simple data store for state management.

My alternative to redux and other state management.

## Install
To get from npm simply run.
```sh
npm install --save simple-data-store
```

Alternatively you can download the code and build it yourself with
```sh
npm run build
```
And in the `dist` folder will be the Javascript and Typescript typings file.

Also the whole thing is one Typescript file so it's pretty easy to manually add it to your own source code.

## Features
- Small file size (about 0.5kb after compression)
- Immutable.
- Simple API.
- Has support for history, with an example implementation found [here](https://github.com/astrellon/simple-data-store/tree/master/history)
- Selector support (along the lines of reselect for redux).
- No dependencies

## Why?
Do we ever need more JS/TS libraries?

I like what redux and other functional state management libraries have done for UI but I found them too unstructured and too generalised. So I put together my own version that is still general but puts just enough structure to fulfil my needs.

## Example
Modifiers are functions that perform an action on the state. This means that the state does not need to know about modifiers at all.

In the example below it is shown that creating a function that returns the modifier with the values in the closure is useful.

```typescript
import DataStore from "../src";

interface SimpleState
{
    readonly counter: number;
}

function change(value: number)
{
    return (state: SimpleState) => ({ counter: state.counter + value });
}

const store = new DataStore<SimpleState>
({
    counter: 0
});

store.subscribeAny((state) => console.log(state));

store.execute(change(1));
store.execute(change(2));
store.execute(change(-1));

/* Example output:
{ counter: 1 }
{ counter: 3 }
{ counter: 2 }
*/
```

There is a longer example at `example/sample.ts`.

# API

## Types
```typescript
// A function to create a patch for the state.
// Meaning this should return a partial state to be merged with the current state.
export type Modifier<TState> = (state: TState) => Partial<TState> | null;

// A function that takes part of the state and returns a sub set of that state.
// Used to look for specific parts of the state that have changed.
export type Selector<TState> = (state: TState) => any;

// A function used to compare if two parts of the state have actually changed.
// By default a strict equals is used when comparing however sometimes something more complex is needed.
export type SelectorComparer<TState> = (prevValue: TState, newValue: TState) => boolean;

// A callback function to be triggered when a selector has returned a new value.
// The callback is given the new state and result of the selector that triggered the callback.
export type Subscription<TState> = (state: TState, newValue: any, triggeringModifier: Modifier<TState>, isNewState: boolean) => void;

// A function used to remove a subscription. This can be called multiple times.
export type RemoveSubscription = () => void;

```

## DataStore
The main data store class. Keeps track of the current state, any subscriptions and optionally a history of the state.

By default history is disabled.

### Constructor
`initialState: TState` The initial state of the store.

The constructor requires an initial state for the store that fits the store's state interface.

```typescript
interface State
{
    readonly name: string;
    readonly age: number;
    readonly interests: string[];
}

const store = new DataStore<State>({
    name: 'Unset',
    age: 0,
    interests: []
});
```

### state
`returns: Readonly<TState>` The current state.

Returns the state marked specifically as readonly.
The readonly part is not usually required but just to make it very clear.

### execute
`modifier: Modifier<TState>` The modifier function to patch the state with.

Executes a modifier on the state.
The modifier is recommended to return a partial state that is merged.

If the modifier returns the same state (as compared with strict equals) or null then
the state is not updated nor is any subscription triggered.

### subscribe
`selector: Selector<TState>` A function for picking the values out of the store you want to check when changed.

`subscription: Subscription<TState>` A callback that will be triggered when the values returned by the selector has changed.

`comparer: SelectorComparer<TState>` An optional comparer for the old and new values in the selector. Defaults to strict equals.

`returns: RemoveSubscription` A function to remove the subscription from the store.

Subscribe a callback to be triggered when a part of the state has changed.


```typescript
import DataStore from "../src";

interface State
{
    age: number;
    name: string;
}

const store = new DataStore<State>
({
    age: 30,
    name: "Fluff"
});

let numberOfAgeChanges = 0;

// Subscribe to any changes to the age by returning the age from the state which will be compared between execute calls.
store.subscribe((state) => state.age, (state, newAge) => console.log('New Age', newAge));

// Subscribe to any changes to the name by returning the name from the state which will be compared between execute calls.
store.subscribe((state) => state.name, (state, newName) => console.log('New Name', newName));

// Subscribe to any changes to the age by adding our own way of comparing age changing.
store.subscribe((state) => state, (state) => numberOfAgeChanges++, (prev, next) => next.age === prev.age);

store.execute((state) => ({age: 35}));
store.execute((state) => ({name: "Puff"}));
store.execute((state) => ({age: 40}));
store.execute((state) => ({age: 40}));

console.log('Number of age changes', numberOfAgeChanges);

/* Example output
New Age 35
New Name Puff
New Age 40
Number of age changes 2
*/
```

### subscribeAny
`subscription: Subscription<TState>` A callback that will be triggered when the state has changed.

`returns: RemoveSubscription` A function to remove the subscription from the store.

A shorthand subscribe function that will trigger the callback when the state changes at all.

### unsubscribeAll
Removes all subscriptions from the store.
# Benchmarks
There's a benchmarks folder with more details however the summery is that SimpleDataStore is roughly similar to redux in terms of performance.

The pros are that it doesn't really matter how many state modifiers you have because there's no additional lookup time to find them compared to reducers.

The cons for very simple states, where the state is a primitive value or the reducer returns the whole state without needing to be combined it's slower than Redux.

The main reason being that SimpleDataStore assumes that the state is always an object and the modifiers will always return a partial state and combines using `Object.assign`. Combined to Redux that always assumes a full state object.

## License
MIT

## Author
Alan Lawrey 2019