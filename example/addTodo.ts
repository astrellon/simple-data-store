import { SimpleState, TodoItem } from './sample';

export function addTodo(todoItem: TodoItem)
{
    return (state: SimpleState) =>
    {
        const todos = [ ...state.todos, todoItem ];
        return { todos };
    }
}