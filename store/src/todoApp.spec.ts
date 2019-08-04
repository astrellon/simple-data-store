import DataStore from ".";

interface TodoItem
{
    readonly id: number;
    readonly text: string;
}

interface State
{
    readonly todos: TodoItem[];
}

function addTodo(todoItem: TodoItem)
{
    return (state: State) =>
    {
        const todos = [ ...state.todos, todoItem ];
        return { todos };
    }
}

function removeTodo(id: number)
{
    return (state: State) =>
    {
        const todos = state.todos.filter(t => t.id !== id);
        return { todos };
    }
}

function updateTodo(id: number, text: string)
{
    return (state: State) =>
    {
        const todos = state.todos.map(todo =>
            {
                if (todo.id === id)
                {
                    return {...todo, text};
                }
                return todo;
            });

        return {todos};
    }
}

const defaultStore: State =
{
    todos: []
}

test('simple todo test', () =>
{
    const store = new DataStore<State>(defaultStore);

    store.execute(addTodo({text: 'Item 1', id: 0}));
    store.execute(addTodo({text: 'Item 2', id: 1}));
    store.execute(addTodo({text: 'Item 3', id: 2}));
    store.execute(removeTodo(0));

    expect(store.state().todos).toStrictEqual([{text: 'Item 2', id: 1}, {text: 'Item 3', id: 2}]);

    store.execute(updateTodo(1, 'Item 2 Done'));

    expect(store.state().todos).toStrictEqual([{text: 'Item 2 Done', id: 1}, {text: 'Item 3', id: 2}]);
});
