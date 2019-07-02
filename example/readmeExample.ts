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