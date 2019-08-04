import { createStore as createReduxStore, Action } from "redux";
import { Suite } from "benchmark";
import createStore from "../src";

console.log('--- Big State Benchmarks ---');

interface State
{
    readonly value0: number;
    readonly value1: number;
    readonly value2: number;
    readonly value3: number;
    readonly value4: number;
    readonly value5: number;
    readonly value6: number;
    readonly value7: number;
    readonly value8: number;
    readonly value9: number;
    readonly value10: number;
    readonly value11: number;
    readonly value12: number;
    readonly value13: number;
    readonly value14: number;
    readonly value15: number;
    readonly value16: number;
    readonly value17: number;
    readonly value18: number;
    readonly value19: number;
}

const defaultState: State =
{
    value0: 0,
    value1: 0,
    value2: 0,
    value3: 0,
    value4: 0,
    value5: 0,
    value6: 0,
    value7: 0,
    value8: 0,
    value9: 0,
    value10: 0,
    value11: 0,
    value12: 0,
    value13: 0,
    value14: 0,
    value15: 0,
    value16: 0,
    value17: 0,
    value18: 0,
    value19: 0
}


function change0(value: number) { return (state: State) => ({value0: state.value0 + value}); }
function change1(value: number) { return (state: State) => ({value1: state.value1 + value}); }
function change2(value: number) { return (state: State) => ({value2: state.value2 + value}); }
function change3(value: number) { return (state: State) => ({value3: state.value3 + value}); }
function change4(value: number) { return (state: State) => ({value4: state.value4 + value}); }
function change5(value: number) { return (state: State) => ({value5: state.value5 + value}); }
function change6(value: number) { return (state: State) => ({value6: state.value6 + value}); }
function change7(value: number) { return (state: State) => ({value7: state.value7 + value}); }
function change8(value: number) { return (state: State) => ({value8: state.value8 + value}); }
function change9(value: number) { return (state: State) => ({value9: state.value9 + value}); }
function change10(value: number) { return (state: State) => ({value10: state.value10 + value}); }
function change11(value: number) { return (state: State) => ({value11: state.value11 + value}); }
function change12(value: number) { return (state: State) => ({value12: state.value12 + value}); }
function change13(value: number) { return (state: State) => ({value13: state.value13 + value}); }
function change14(value: number) { return (state: State) => ({value14: state.value14 + value}); }
function change15(value: number) { return (state: State) => ({value15: state.value15 + value}); }
function change16(value: number) { return (state: State) => ({value16: state.value16 + value}); }
function change17(value: number) { return (state: State) => ({value17: state.value17 + value}); }
function change18(value: number) { return (state: State) => ({value18: state.value18 + value}); }
function change19(value: number) { return (state: State) => ({value19: state.value19 + value}); }

function reduxChange(index: number, value: number)
{
    return {type: 'CHANGE' + index, value};
}

function reduxReducer(state: State = defaultState, action :Action<string>)
{
    switch (action.type)
    {
        case 'CHANGE0': return {...state, value0: state.value0 + (action as any).value};
        case 'CHANGE1': return {...state, value1: state.value1 + (action as any).value};
        case 'CHANGE2': return {...state, value2: state.value2 + (action as any).value};
        case 'CHANGE3': return {...state, value3: state.value3 + (action as any).value};
        case 'CHANGE4': return {...state, value4: state.value4 + (action as any).value};
        case 'CHANGE5': return {...state, value5: state.value5 + (action as any).value};
        case 'CHANGE6': return {...state, value6: state.value6 + (action as any).value};
        case 'CHANGE7': return {...state, value7: state.value7 + (action as any).value};
        case 'CHANGE8': return {...state, value8: state.value8 + (action as any).value};
        case 'CHANGE9': return {...state, value9: state.value9 + (action as any).value};
        case 'CHANGE10': return {...state, value10: state.value10 + (action as any).value};
        case 'CHANGE11': return {...state, value11: state.value11 + (action as any).value};
        case 'CHANGE12': return {...state, value12: state.value12 + (action as any).value};
        case 'CHANGE13': return {...state, value13: state.value13 + (action as any).value};
        case 'CHANGE14': return {...state, value14: state.value14 + (action as any).value};
        case 'CHANGE15': return {...state, value15: state.value15 + (action as any).value};
        case 'CHANGE16': return {...state, value16: state.value16 + (action as any).value};
        case 'CHANGE17': return {...state, value17: state.value17 + (action as any).value};
        case 'CHANGE18': return {...state, value18: state.value18 + (action as any).value};
        case 'CHANGE19': return {...state, value19: state.value19 + (action as any).value};

        default:
            return state;
    }
}

const store = createStore<State>(defaultState, () => {});
const reduxStore = createReduxStore(reduxReducer, defaultState);

const suite = new Suite('Big State');
// add tests
suite.add('SimpleDataStore', function ()
    {
        store(change0(1));
        store(change0(-1));
        store(change1(1));
        store(change1(-1));
        store(change2(1));
        store(change2(-1));
        store(change3(1));
        store(change3(-1));
        store(change4(1));
        store(change4(-1));
        store(change5(1));
        store(change5(-1));
        store(change6(1));
        store(change6(-1));
        store(change7(1));
        store(change7(-1));
        store(change8(1));
        store(change8(-1));
        store(change9(1));
        store(change9(-1));
        store(change10(1));
        store(change10(-1));
        store(change11(1));
        store(change11(-1));
        store(change12(1));
        store(change12(-1));
        store(change13(1));
        store(change13(-1));
        store(change14(1));
        store(change14(-1));
        store(change15(1));
        store(change15(-1));
        store(change16(1));
        store(change16(-1));
        store(change17(1));
        store(change17(-1));
        store(change18(1));
        store(change18(-1));
        store(change19(1));
        store(change19(-1));
    })
    .add('Redux', function ()
    {
        reduxStore.dispatch(reduxChange(0, 1));
        reduxStore.dispatch(reduxChange(0, -1));
        reduxStore.dispatch(reduxChange(1, 1));
        reduxStore.dispatch(reduxChange(1, -1));
        reduxStore.dispatch(reduxChange(2, 1));
        reduxStore.dispatch(reduxChange(2, -1));
        reduxStore.dispatch(reduxChange(3, 1));
        reduxStore.dispatch(reduxChange(3, -1));
        reduxStore.dispatch(reduxChange(4, 1));
        reduxStore.dispatch(reduxChange(4, -1));
        reduxStore.dispatch(reduxChange(5, 1));
        reduxStore.dispatch(reduxChange(5, -1));
        reduxStore.dispatch(reduxChange(6, 1));
        reduxStore.dispatch(reduxChange(6, -1));
        reduxStore.dispatch(reduxChange(7, 1));
        reduxStore.dispatch(reduxChange(7, -1));
        reduxStore.dispatch(reduxChange(8, 1));
        reduxStore.dispatch(reduxChange(8, -1));
        reduxStore.dispatch(reduxChange(9, 1));
        reduxStore.dispatch(reduxChange(9, -1));
        reduxStore.dispatch(reduxChange(10, 1));
        reduxStore.dispatch(reduxChange(10, -1));
        reduxStore.dispatch(reduxChange(11, 1));
        reduxStore.dispatch(reduxChange(11, -1));
        reduxStore.dispatch(reduxChange(12, 1));
        reduxStore.dispatch(reduxChange(12, -1));
        reduxStore.dispatch(reduxChange(13, 1));
        reduxStore.dispatch(reduxChange(13, -1));
        reduxStore.dispatch(reduxChange(14, 1));
        reduxStore.dispatch(reduxChange(14, -1));
        reduxStore.dispatch(reduxChange(15, 1));
        reduxStore.dispatch(reduxChange(15, -1));
        reduxStore.dispatch(reduxChange(16, 1));
        reduxStore.dispatch(reduxChange(16, -1));
        reduxStore.dispatch(reduxChange(17, 1));
        reduxStore.dispatch(reduxChange(17, -1));
        reduxStore.dispatch(reduxChange(18, 1));
        reduxStore.dispatch(reduxChange(18, -1));
        reduxStore.dispatch(reduxChange(19, 1));
        reduxStore.dispatch(reduxChange(19, -1));
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