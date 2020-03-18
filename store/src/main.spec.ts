import DataStore from ".";

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

    expect(store.state().counter).toBe(0);

    const counterValues: number[] = [];

    const unsub = store.subscribeAny((state) => counterValues.push(state.counter));

    store.execute(changeCounter(1));
    store.execute(changeCounter(6));

    expect(store.state().counter).toBe(7);

    store.execute(changeCounter(-3));

    expect(store.state().counter).toBe(4);

    expect(counterValues).toStrictEqual([1, 7, 4]);

    unsub();

    store.execute(changeCounter(1));

    expect(store.state().counter).toBe(5);
    expect(counterValues).toStrictEqual([1, 7, 4]);
});

test('custom selector', () =>
{
    const store = new DataStore<State>({counter: 0});

    let numberOfChanges = 0;
    let numberOfCustomChanges = 0;
    let numberOfCustomNumberChanges = 0;
    let numberOfAnyChanges = 0;

    const unsub = store.subscribe((state) => state.counter, (state) => numberOfChanges++);
    const unsubCustom = store.subscribe((state) => state, (state) => numberOfCustomChanges++, (prev: State, next: State) => next.counter === prev.counter);
    const unsubCustomNumbers = store.subscribe((state) => state.counter, (state) => numberOfCustomNumberChanges++, (prev: number, next: number) => next === prev);
    const unsubAny = store.subscribeAny((state) => numberOfAnyChanges++);

    store.execute(changeCounter(1));
    store.execute(changeCounter(1));

    expect(numberOfAnyChanges).toBe(2);
    expect(numberOfCustomChanges).toBe(2);
    expect(numberOfCustomNumberChanges).toBe(2);
    expect(numberOfChanges).toBe(2);

    store.execute(changeCounter(0));
    store.execute(changeCounter(0));

    expect(numberOfAnyChanges).toBe(4);
    expect(numberOfCustomChanges).toBe(2);
    expect(numberOfCustomNumberChanges).toBe(2);
    expect(numberOfChanges).toBe(2);

    store.execute((state) => null);

    expect(numberOfAnyChanges).toBe(4);
    expect(numberOfCustomChanges).toBe(2);
    expect(numberOfCustomNumberChanges).toBe(2);
    expect(numberOfChanges).toBe(2);

    store.unsubscribeAll();

    store.execute(changeCounter(1));
    store.execute(changeCounter(1));

    expect(numberOfAnyChanges).toBe(4);
    expect(numberOfCustomChanges).toBe(2);
    expect(numberOfCustomNumberChanges).toBe(2);
    expect(numberOfChanges).toBe(2);

    unsub();
    unsub();

    unsubCustom();
    unsubCustom();

    unsubAny();
    unsubAny();

    store.execute(changeCounter(1));
    store.execute(changeCounter(1));

    expect(numberOfAnyChanges).toBe(4);
    expect(numberOfCustomChanges).toBe(2);
    expect(numberOfCustomNumberChanges).toBe(2);
    expect(numberOfChanges).toBe(2);
});