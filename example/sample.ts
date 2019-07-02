import DataStore from "../src";
import { Counter } from "./counter";
import { AddTodo } from "./addTodo";
import { RemoveTodo } from "./removeTodo";

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
store.addReducer(Counter);
store.addReducer(AddTodo);
store.addReducer(RemoveTodo);

store.currentState

const unsubscribeAny = store.subscribeAny(
    (state) => console.log('Sub Any', state)
);
const unsubscribeCounter = store.subscribe(
    (state) => state.counter,
    (state) => console.log('Sub Counter', state)
);

store.dispatch(Counter.inc());
store.dispatch(Counter.inc());
store.dispatch(Counter.dec());

store.dispatch(AddTodo.action({text: 'Item 1', id: 0}));
store.dispatch(AddTodo.action({text: 'Item 2', id: 1}));
store.dispatch(RemoveTodo.action(0));

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
