# Simple Data Store
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
- Small file size (about 1kb after compression)
- Immutable.
- Simple API.
- More structure than something like Redux, keeps things simple once you have dozens of reducers/modifiers.
- History support.
- Selector support (along the lines of reselect for redux).
- No dependencies

## Missing Features
- No way to replay history on another computer or session, this may not ever be possible without further work.

## Why?
Do we ever need more JS/TS libraries?

I like what redux and other functional state management libraries have done for UI but I found them too unstructured and too generalised. So I put together my own version that is still general but puts just enough structure to fulfil my needs.

## Example
Reducers are functions that perform an action on the state. This means that the state does not need to know about reducers at all.

In the example below it is shown that creating a function that returns the reducer with the values in the closure is useful.

```typescript
import DataStore, { HistoryStore } from "../src";

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

// History store is kind of like an extension.
// Really it's just an application of the subscribeAny and execute methods.
const historyStore = new HistoryStore<SimpleState>(store, 100);

store.subscribeAny((state) => console.log(state));

store.execute(change(1));
store.execute(change(2));
store.execute(change(-1));

historyStore.back();

/* Example output:
{ counter: 1 }
{ counter: 3 }
{ counter: 2 }
{ counter: 3 }
*/
```

There is a longer example at `example/sample.ts`.

## API

### Types
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

// A callback function to be triggered when a new history item is added.
export type HistorySubscription<TState> = (triggeringModifier: Modifier<TState>, historyState: TState) => void;

// An item in the history. Keeps track of the modifier that created the state.
// A null modifier means the start of the history.
export interface HistoryItem<TState>
{
    readonly modifier: Modifier<TState> | null;
    readonly state: TState;
}
```

### DataStore
The main data store class. Keeps track of the current state, any subscriptions and optionally a history of the state.

By default history is disabled.

#### Constructor
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

#### state
`returns: Readonly<TState>` The current state.

Returns the state marked specifically as readonly.
The readonly part is not usually required but just to make it very clear.

#### execute
`modifier: Modifier<TState>` The modifier function to patch the state with.

Executes a modifier on the state.
The modifier is recommended to return a partial state that is merged.

If the modifier returns the same state (as compared with strict equals) or null then
the state is not updated nor is any subscription triggered.

#### subscribe
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

store.subscribe((state) => state.age, (state, newAge) => console.log('New Age', newAge));
store.subscribe((state) => state.name, (state, newName) => console.log('New Name', newName));

store.execute((state) => ({age: 35}));
store.execute((state) => ({name: "Puff"}));
store.execute((state) => ({age: 40}));

/* Example output
New Age 35
New Name Puff
New Age 40
*/
```

#### subscribeAny
`subscription: Subscription<TState>` A callback that will be triggered when the state has changed.

`returns: RemoveSubscription` A function to remove the subscription from the store.

A shorthand subscribe function that will trigger the callback when the state changes at all.

#### unsubscribeAll
Removes all subscriptions from the store.

### HistoryStore
The history store is a helper store for keeping track of all changes to the store and allows for going back and forth through that history.

The history store itself is just an application of using a subscription and executing a modifier and doesn't rely on any internal API.

#### Constructor
`store: DataStore<TState>` The parent store to listen for the history of.

`limiter: number = 100` The limiting number for how many items to keep. A value of zero will keep all items.

Creates a new history store. The first thing the history store will do is populate the first history with the current state of the store.

#### getIndex
`returns: number` The current index in to the history items list.

Returns the current index in to the history items list.

#### getItems
`returns: Readonly<HistoryItem<TState>[]>` The list of history items.

Returns the current list of history items.

#### subscribe
`subscription: HistorySubscription<TState>` A callback to be trigger when a new history item is added.

`returns: RemoveSubscription` A function to remove the subscription from the store.

Subscribe a callback to be triggered when a new history item is added.

#### setEnabled
`enabled: boolean` Sets if the history is enabled or not.

Sets if the history should be enabled or not. Internally it is subscribing and unsubscribing from the store.

#### isEnabled
`returns: boolean` Returns true if the history store is enabled.

Returns true if the store is enabled.

#### clear
Clears the history items from the history store.

#### back
Goes back one item in the history. If history is disabled or is at the start of the history nothing is triggered.

#### forward
Goes forward one item in the history. If the history is disabled or at the most recent item nothing is triggered.

#### goto
`index: number` The history index to go to.

Goes to the history index. If it is out of outs, the index is the same as the current one or history is disabled then nothing is trigged.

## License
MIT

## Author
Alan Lawrey 2019