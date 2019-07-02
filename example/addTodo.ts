import { BaseReducer } from '../src/index';
import { SimpleState, TodoItem } from './sample';

interface ReducerAction
{
    readonly todoItem: TodoItem;
}

class Reducer extends BaseReducer<SimpleState, ReducerAction>
{
    public action(todoItem: TodoItem)
    {
        return this.createAction({ todoItem });
    }

    public execute (state: SimpleState, action: ReducerAction): SimpleState
    {
        const todos = [ ...state.todos, action.todoItem ];
        return { ...state, todos};
    }
}

export const AddTodo = new Reducer('ADD_TODO');