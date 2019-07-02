import { BaseReducer } from '../src/index';
import { SimpleState } from './sample';

interface ReducerAction
{
    readonly id: number;
}

class Reducer extends BaseReducer<SimpleState, ReducerAction>
{
    public action(id: number)
    {
        return this.createAction({ id });
    }

    public execute (state: SimpleState, action: ReducerAction): SimpleState
    {
        const todos = state.todos.filter(t => t.id !== action.id);
        return { ...state, todos};
    }
}

export const RemoveTodo = new Reducer('REMOVE_TODO');