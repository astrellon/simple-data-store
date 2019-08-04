import DataStore from "simple-data-store";
import HistoryStore from "../src";

function inc()
{
    return (state: SimpleState) => ({ counter: state.counter + 1 });
}

interface SimpleState
{
    readonly counter: number;
}

const store = new DataStore<SimpleState>
({
    counter: 0
});

console.time('Without');
for (let i = 0; i < 100000; i++)
{
    store.execute(inc());
}
console.timeEnd('Without');

const historyStore = new HistoryStore<SimpleState>(store, 100);
console.time('With');
for (let i = 0; i < 100000; i++)
{
    store.execute(inc());
}
console.timeEnd('With');

historyStore.setEnabled(false);
console.time('Without');
for (let i = 0; i < 100000; i++)
{
    store.execute(inc());
}
console.timeEnd('Without');

historyStore.setEnabled(true);
console.time('With');
for (let i = 0; i < 100000; i++)
{
    store.execute(inc());
}
console.timeEnd('With');