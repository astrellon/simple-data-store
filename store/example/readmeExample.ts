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