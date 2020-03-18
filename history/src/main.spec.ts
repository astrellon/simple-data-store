import DataStore from 'simple-data-store';
import HistoryStore from ".";

interface State
{
    counter: number;
}

function changeCounter(value: number)
{
    return (state: State) => ({counter: state.counter + value});
}

test('larger test involving different features', () =>
{
    const store = new DataStore<State>({counter: 0});
    const historyStore = new HistoryStore<State>(store);

    expect(store.state().counter).toBe(0);

    const counterValues: number[] = [];

    const unsub = store.subscribeAny((state) => counterValues.push(state.counter));

    store.execute(changeCounter(1));
    store.execute(changeCounter(6));
    store.execute(changeCounter(-3));

    expect(store.state().counter).toBe(4);

    historyStore.back();

    expect(store.state().counter).toBe(7);

    historyStore.goto(1);

    expect(store.state().counter).toBe(1);
    expect(counterValues).toStrictEqual([1, 7, 4, 7, 1]);

    unsub();

    historyStore.setEnabled(false);

    store.execute(changeCounter(1));

    expect(store.state().counter).toBe(2);
    expect(counterValues).toStrictEqual([1, 7, 4, 7, 1]);
});

test('history jumping around', () =>
{
    const store = new DataStore<State>({counter: 0});
    const historyStore = new HistoryStore<State>(store, 5);

    let numberOfHistoryChanges = 0;

    const unsubHistory = historyStore.subscribe(() => numberOfHistoryChanges++);

    const inc = changeCounter(1);

    for (let i = 0; i < 4; i++)
    {
        store.execute(inc);
    }

    expect(numberOfHistoryChanges).toBe(4);

    let counterValues = historyStore.getItems().map(item => item.state.counter);
    expect(counterValues).toStrictEqual([0, 1, 2, 3, 4]);
    expect(historyStore.getIndex()).toBe(4);

    store.execute(inc);
    store.execute(inc);

    expect(numberOfHistoryChanges).toBe(6);

    counterValues = historyStore.getItems().map(item => item.state.counter);
    expect(counterValues).toStrictEqual([2, 3, 4, 5, 6]);
    expect(historyStore.getIndex()).toBe(4);

    historyStore.goto(2);
    expect(historyStore.getIndex()).toBe(2);
    expect(store.state().counter).toBe(4);

    historyStore.goto(0);
    expect(historyStore.getIndex()).toBe(0);
    expect(store.state().counter).toBe(2);

    historyStore.back();
    expect(historyStore.getIndex()).toBe(0);
    expect(store.state().counter).toBe(2);

    historyStore.forward();
    expect(store.state().counter).toBe(3);
    expect(historyStore.getIndex()).toBe(1);

    expect(numberOfHistoryChanges).toBe(6);

    unsubHistory();
    unsubHistory();

    store.execute(inc);
    expect(store.state().counter).toBe(4);

    expect(numberOfHistoryChanges).toBe(6);

    counterValues = historyStore.getItems().map(item => item.state.counter);
    expect(counterValues).toStrictEqual([2, 3, 4]);
    expect(historyStore.getIndex()).toBe(2);

    expect(historyStore.isEnabled()).toBeTruthy();

    historyStore.setEnabled(false);

    expect(historyStore.isEnabled()).toBeFalsy();

    const unsubHistory2 = historyStore.subscribe(() => numberOfHistoryChanges++);

    store.execute(inc);
    store.execute(inc);
    expect(numberOfHistoryChanges).toBe(6);

    historyStore.setEnabled(true);

    store.execute(inc);
    store.execute(inc);
    expect(numberOfHistoryChanges).toBe(8);
});