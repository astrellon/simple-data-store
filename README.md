# Simple Data Store
A Typescript based simple data store for state management.

My alternative to redux and other state management.

## Features
- Small file size (about 1kb after compression)
- Immutable
- Simple API
- More structure than something like Redux, keeps things simple once you have dozens of reducers.
- No dependencies

## Todo
- History support
- More advanced features like thunk, but that's to be decided.

## Why?
Do we ever need more JS/TS libraries?

I like what redux and other functional state management libraries have done for UI but I found them too unstructured and too generalised. So I put together my own version that is still general but puts just enough structure to fulfil my needs.

The only thing missing is history support at the moment and that should not be a big task, it's just not been needed.

## Example
The main difference between this store and others like redux is that there is only one reducer that runs for any action. Which means that there's no need to combine reducers and have each one check if the action running is one that you want to manipulate.

While there is a bit of boiler plate each reducer is fairly simple and you know that the reducer type should be correct. As shown in the `Counter` example, you can make the reducer and it's action as complicated as needed or in the case of the `Todo` you can do things like adding and removing as two separate actions. However you could always do that in the one and make the action interface more complicated.

```typescript
import DataStore, { BaseReducer } from "../src";

interface ReducerAction
{
    change: number;
}

class CounterReducer extends BaseReducer<SimpleState, ReducerAction>
{
    public inc()
    {
        // This is a shortcut for saying
        // return { type: 'COUNTER', change: 1 };
        return this.createAction({change: 1});
    }

    public dec()
    {
        return this.createAction({change: -1});
    }

    public execute (state: SimpleState, action: ReducerAction): SimpleState
    {
        return { ...state, counter: state.counter + action.change };
    }
}
const Counter = new CounterReducer('COUNTER');

interface SimpleState
{
    readonly counter: number;
}

const defaultStore: SimpleState = {
    counter: 0
}

const store = new DataStore<SimpleState>(defaultStore);
store.addReducer(Counter);

store.subscribeAny((state) => console.log(state));

store.dispatch(Counter.inc());
store.dispatch(Counter.inc());
store.dispatch(Counter.dec());

/* Example output:
{ counter: 1 }
{ counter: 2 }
{ counter: 1 }
*/
```

Whilst perhaps not as elegant as a simple redux example, the enforced structure of adding reducers to the store does not become any more complex as there are more added. Additionally it also means that you don't end up with the potential of having many reducer function calls all just to check if the action type is correct.

There is a longer example at `example/sample.ts`.

## API

### Types
```typescript
// A function that takes part of the state and returns a sub set of that state.
// Used to look for specific parts of the state that have changed.
type Selector<TState> = (state: TState) => any;

// A function used to compare if two parts of the state have actually changed.
// By default a strict equals is used when comparing however sometimes something more complex is needed.
type SelectorComparer<TState> = (prevValue: TState, newValue: TState) => boolean;

// A callback function to be triggered when a selector has returned a new value.
// The callback is given the new state and result of the selector that triggered the callback.
type Callback<TState> = (state: TState, newValue: any) => void;

// A function used to remove a subscribedd callback. This can be called multiple times.
type RemoveCallback = () => void;

// A function used to remove a reducer. This can be called multiple times.
type RemoveReducer = () => void;
```

### BaseReducer
The BaseReducer class is the abstract base class for all reducers. A reducer needs to define an `execute` method for modifying the state based on an action and for setting the `actionType` string which sets when it will be called.

```typescript
interface ReducerAction
{
    value: number;
}

class Reducer extends BaseReducer<State, ReducerAction>
{
    public change(value: number)
    {
        return this.createAction({value});
    }

    public execute (state: SimpleState, action: ReducerAction): SimpleState
    {
        return { ...state, counter: state.counter + action.value };
    }
}
export const Counter = new Reducer('COUNTER');
```

### DataStore
The data store is effectively just a container for the current state, the map of reducers and list of subscribers.

#### Constructor
`initialState: TState`: The initial state of the store.

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

#### addReducer
`reducer: BaseReducer<TState>`: An instance of a reducer class.
`returns: RemoveReducer`: Returns a function to remove the reducer from the store.

This adds an instance of a reducer to the data store. If a reducer with the same `actionType` is added to the store an error is thrown.

#### dispatch
`action: Action`: The action to dispatch.

This triggers a reducer to run based on the `type` set on the action. If no reducer matches that type a console.error is logged at the moment.

#### tryDispatch
`action?: Action`: The action to dispatch, or null/undefined.

A helper function to call `dispatch` if the action is not null or undefined.
There are a few cases where an action may or may not be null or undefined which can be useful for conditionally creating actions and thus conditionally dispatching them.

#### subscribe
`selector: Selector<TState>`: A function for picking the values out of the store you want to check when changed.
`callback: Callback<TState>`: A callback that will be triggered when the values returned by the selector has changed.
`comparer: SelectorComparer<TState>`: An optional comparer for the old and new values in the selector. Defaults to strict equals.
`returns: RemoveCallback`: Returns a function to unsubscribe from the store.

Subscribe a callback to be triggered when a part of the state has changed.

#### subscribeAny
`callback: Callback<TState>`: A callback that will be triggered when the state has changed.
`returns: RemoveCallback`: Returns a function to unsubscribe from the store.

A shorthand subscribe function that will trigger the callback when the state changes at all.


## License
MIT

## Author
Alan Lawrey 2019