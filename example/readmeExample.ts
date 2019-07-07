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