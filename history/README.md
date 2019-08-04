# Simple Data Store History
![NPM](https://badgen.net/npm/v/simple-data-store-history)![Badge for Gzip size](https://badgen.net/bundlephobia/minzip/simple-data-store-history)

An extention to [SimpleDataStore](https://github.com/astrellon/simple-data-store) to add history support.

The history store is able to hook into the stores subscription and keeps track of all the changes to the state and then can replay a state when needed to.

## Install
To get from npm simply run.
```sh
npm install --save simple-data-store-history
```

Simple Data Store is a peer dependency and won't work without it.

## Example

```typescript
import DataStore from "simple-data-store";
import HistoryStore from "../src";

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

# API

## HistoryStore
The history store is a helper store for keeping track of all changes to the store and allows for going back and forth through that history.

The history store itself is just an application of using a subscription and executing a modifier and doesn't rely on any internal API.

### Constructor
`store: DataStore<TState>` The parent store to listen for the history of.

`limiter: number = 100` The limiting number for how many items to keep. A value of zero will keep all items.

Creates a new history store. The first thing the history store will do is populate the first history with the current state of the store.

### getIndex
`returns: number` The current index in to the history items list.

Returns the current index in to the history items list.

### getItems
`returns: Readonly<HistoryItem<TState>[]>` The list of history items.

Returns the current list of history items.

### subscribe
`subscription: HistorySubscription<TState>` A callback to be trigger when a new history item is added.

`returns: RemoveSubscription` A function to remove the subscription from the store.

Subscribe a callback to be triggered when a new history item is added.

### setEnabled
`enabled: boolean` Sets if the history is enabled or not.

Sets if the history should be enabled or not. Internally it is subscribing and unsubscribing from the store.

### isEnabled
`returns: boolean` Returns true if the history store is enabled.

Returns true if the store is enabled.

### clear
Clears the history items from the history store.

### back
Goes back one item in the history. If history is disabled or is at the start of the history nothing is triggered.

### forward
Goes forward one item in the history. If the history is disabled or at the most recent item nothing is triggered.

### goto
`index: number` The history index to go to.

Goes to the history index. If it is out of outs, the index is the same as the current one or history is disabled then nothing is trigged.

## License
MIT

## Author
Alan Lawrey 2019