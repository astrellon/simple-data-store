import DataStore, { HistoryStore } from ".";

interface State
{
    counter: number;
}

test('larger test involving different features', () =>
{
    const store = new DataStore<State>({counter: 0});
    const historyStore = new HistoryStore<State>(store);

    expect(store.state().counter).toBe(0);

    const counterValues: number[] = [];

    const unsub = store.subscribeAny((state) => counterValues.push(state.counter));

    store.execute((state) => ({counter: state.counter + 1}));
    store.execute((state) => ({counter: state.counter + 6}));
    store.execute((state) => ({counter: state.counter - 3}));

    expect(store.state().counter).toBe(4);

    historyStore.back();

    expect(store.state().counter).toBe(7);

    historyStore.goto(1);

    expect(store.state().counter).toBe(1);
    expect(counterValues).toStrictEqual([1, 7, 4, 7, 1]);

    unsub();

    historyStore.setEnabled(false);

    store.execute((state) => ({counter: state.counter + 1}));

    expect(store.state().counter).toBe(2);
    expect(counterValues).toStrictEqual([1, 7, 4, 7, 1]);
});