import DataStore from ".";

interface State
{
    counter: number;
}

test('larger test involving different features', () =>
{
    const store = new DataStore<State>({counter: 0});
    store.setEnableHistory(true);

    expect(store.state().counter).toBe(0);

    const counterValues: number[] = [];

    const unsub = store.subscribeAny((state) => counterValues.push(state.counter));

    store.execute((state) => ({counter: state.counter + 1}));
    store.execute((state) => ({counter: state.counter + 6}));
    store.execute((state) => ({counter: state.counter - 3}));

    expect(store.state().counter).toBe(4);

    store.historyBack();

    expect(store.state().counter).toBe(7);

    store.historyGoto(1);

    expect(store.state().counter).toBe(1);
    expect(counterValues).toStrictEqual([1, 7, 4, 7, 1]);

    unsub();

    store.setEnableHistory(false);

    store.execute((state) => ({counter: state.counter + 1}));

    expect(store.state().counter).toBe(2);
    expect(counterValues).toStrictEqual([1, 7, 4, 7, 1]);
});