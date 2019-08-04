import createStore from ".";

interface State
{
    counter: number;
}

function changeCounter(value: number)
{
    return (state: State) => ({counter: state.counter + value});
}

const defaultStore: State = {counter: 0};

test('larger test involving different features', () =>
{
    let currentState: State = defaultStore;
    const store = createStore<State>(defaultStore, (state) =>
    {
        currentState = state;
        counterValues.push(state.counter);
    });

    expect(currentState.counter).toBe(0);

    const counterValues: number[] = [];

    store(changeCounter(1));
    store(changeCounter(6));
    store(changeCounter(-3));

    expect(currentState.counter).toBe(4);
});
