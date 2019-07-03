import { SimpleState } from './sample';

export function removeTodo(id: number)
{
    return (state: SimpleState) =>
    {
        const todos = state.todos.filter(t => t.id !== id);
        return { todos };
    }
}