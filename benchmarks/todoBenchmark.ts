import { createStore as createReduxStore, Action } from "redux";
import { Suite } from "benchmark";
import createStore from "../src";

console.log('--- Todo App Benchmarks ---');

// Common
interface TodoItem
{
    readonly id: number;
    readonly text: string;
}

interface State
{
    readonly todos: TodoItem[];
    readonly counter: number;
}

const defaultStore: State =
{
    todos: [],
    counter: 0
}

// Simple-Data-Store
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
                    return {...todo, text: text};
                }
                return todo;
            });

        return {todos};
    }
}

function changeCounter(value: number)
{
    return (state: State) => ({counter: state.counter + value});
}

// Redux
function reduxReducer(state: State = defaultStore, action: Action<string>)
{
    switch (action.type) {
        case 'ADD':
        {
            const todos = [ ...state.todos, (action as any).todoItem ];
            return { ...state, todos };
        }
        case 'REMOVE':
        {
            const todos = state.todos.filter(t => t.id !== (action as any).id);
            return { ...state, todos };
        }
        case 'UPDATE':
        {
            const todos = state.todos.map(todo =>
            {
                if (todo.id === (action as any).id)
                {
                    return { ...todo, text: (action as any).text };
                }
                return todo;
            });

            return { ...state, todos };
        }
        case 'COUNTER':
            {
                return {...state, counter: state.counter + (action as any).value};
            }
        default:
            return state;
    }
}

function reduxAddTodo(id: number, text: string)
{
    return {type: 'ADD', todoItem: {id, text}};
}
function reduxUpdateTodo(id: number, text: string)
{
    return {type: 'UPDATE', id, text};
}
function reduxRemoveTodo(id: number)
{
    return {type: 'REMOVE', id};
}
function reduxChangeCounter(value: number)
{
    return {type: 'COUNTER', value};
}

const store = createStore<State>(defaultStore, () => {});
const reduxStore = createReduxStore(reduxReducer, defaultStore);

const suite = new Suite('Todo App');

// add tests
suite.add('SimpleDataStore', function ()
    {
        store(addTodo({id: 0, text: 'Item 1'}));
        store(addTodo({id: 1, text: 'Item 2'}));
        store(updateTodo(0, 'Item 1 Done'));
        store(updateTodo(1, 'Item 2 Done'));
        store(changeCounter(1));
        store(changeCounter(-1));
        store(removeTodo(0));
        store(removeTodo(1));
    })
    .add('Redux', function ()
    {
        reduxStore.dispatch(reduxAddTodo(0, 'Item 1'));
        reduxStore.dispatch(reduxAddTodo(1, 'Item 2'));
        reduxStore.dispatch(reduxUpdateTodo(0, 'Item 1 Done'));
        reduxStore.dispatch(reduxUpdateTodo(1, 'Item 2 Done'));
        reduxStore.dispatch(reduxChangeCounter(1));
        reduxStore.dispatch(reduxChangeCounter(-1));
        reduxStore.dispatch(reduxRemoveTodo(0));
        reduxStore.dispatch(reduxRemoveTodo(1));
    })
    // add listeners
    .on('cycle', function (event: any)
    {
        console.log(String(event.target));
    })
    .on('complete', function (this: Suite)
    {
        console.log('Fastest is ', (this.filter('fastest') as any).map('name'));
    })
    // run async
    .run({ 'async': true });