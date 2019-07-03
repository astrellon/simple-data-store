import DataStore from "../src";

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
store.setEnableHistory(false);

console.time('Without');
for (let i = 0; i < 100000; i++)
{
    store.execute(inc());
}
console.timeEnd('Without');

store.setEnableHistory(true);
console.time('With');
for (let i = 0; i < 100000; i++)
{
    store.execute(inc());
}
console.timeEnd('With');

store.setEnableHistory(false);
console.time('Without');
for (let i = 0; i < 100000; i++)
{
    store.execute(inc());
}
console.timeEnd('Without');

store.setEnableHistory(true);
console.time('With');
for (let i = 0; i < 100000; i++)
{
    store.execute(inc());
}
console.timeEnd('With');

console.log(store.getHistory().limiter);