import { Suite } from "benchmark";
import DataStore, { Modifier } from "../src";
import { createStore, Action } from "redux";

const suite = new Suite();

interface State
{
    counter: number;
}

const store1 = new DataStore<State>({counter: 0});
const store2 = new DataStore<State>({counter: 0});

function inc(): Modifier<State>
{
    return (state: State) => ({counter: state.counter + 1});
}
function dec(): Modifier<State>
{
    return (state: State) => ({counter: state.counter - 1});
}
function change(value: number): Modifier<State>
{
    return (state: State) => ({counter: state.counter + value});
}

function reduxCounter1(reduxState: State, action: Action<string>)
{
    switch (action.type) {
        case 'INC':
            return {counter: reduxState.counter + 1};
        case 'DEC':
            return {counter: reduxState.counter - 1};
        default:
            return reduxState;
    }
}
function reduxCounter2(reduxState: State, action: Action<string>)
{
    switch (action.type) {
        case 'CHANGE':
            return {counter: reduxState.counter + (action as any).value};
        default:
            return reduxState;
    }
}

function reduxInc()
{
    return {type: 'INC'};
}
function reduxDec()
{
    return {type: 'DEC'};
}
function reduxChange(value: number)
{
    return {type: 'CHANGE', value};
}
const reduxStore1 = createStore(reduxCounter1, {counter: 0});
const reduxStore2 = createStore(reduxCounter2, {counter: 0});

// add tests
suite.add('NoArgModifiers', function ()
    {
        store1.execute(inc());
        store1.execute(dec());
    })
    .add('ArgModifiers', function ()
    {
        store2.execute(change(1));
        store2.execute(change(-1));
    })
    .add('NoArgRedux', function()
    {
        reduxStore1.dispatch(reduxInc());
        reduxStore1.dispatch(reduxDec());
    })
    .add('ArgRedux', function()
    {
        reduxStore2.dispatch(reduxChange(1));
        reduxStore2.dispatch(reduxChange(-1));
    })
    // add listeners
    .on('cycle', function (event: any)
    {
        console.log(String(event.target));
    })
    .on('complete', function ()
    {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    // run async
    .run({ 'async': true });