import { BaseReducer } from '../src/index';
import { SimpleState } from './sample';

interface ReducerAction
{
    change: number;
}

class Reducer extends BaseReducer<SimpleState, ReducerAction>
{
    public inc()
    {
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
export const Counter = new Reducer('COUNTER');