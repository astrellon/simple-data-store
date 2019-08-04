import DataStore from "../src";
import { inc, dec } from "./counter";
import { addTodo } from "./addTodo";
import { removeTodo } from "./removeTodo";

export interface TodoItem
{
    readonly id: number;
    readonly text: string;
}

export interface SimpleState
{
    readonly counter: number;
    readonly todos: TodoItem[];
}

const defaultStore: SimpleState =
{
    counter: 0,
    todos: []
}

const store = new DataStore<SimpleState>(defaultStore);

const unsubscribeAny = store.subscribeAny(
    (state) => console.log('Sub Any', state)
);
const unsubscribeCounter = store.subscribe(
    (state) => state.counter,
    (state) => console.log('Sub Counter', state)
);

store.execute(inc());
store.execute(inc());
store.execute(dec());

store.execute(addTodo({text: 'Item 1', id: 0}));
store.execute(addTodo({text: 'Item 2', id: 1}));
store.execute(removeTodo(0));

/* Example output:
Sub Any { counter: 1, todos: [] }
Sub Counter { counter: 1, todos: [] }
Sub Any { counter: 2, todos: [] }
Sub Counter { counter: 2, todos: [] }
Sub Any { counter: 1, todos: [] }
Sub Counter { counter: 1, todos: [] }
Sub Any { counter: 1, todos: [ { text: 'Item 1', id: 0 } ] }
Sub Any { counter: 1, todos: [ { text: 'Item 1', id: 0 }, { text: 'Item 2', id: 1 } ] }
Sub Any { counter: 1, todos: [ { text: 'Item 2', id: 1 } ] }
*/
