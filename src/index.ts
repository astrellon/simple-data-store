// A function to create a patch for the state.
// Meaning this should return a partial state to be merged with the current state.
export type Modifier<TState> = (state: TState) => Partial<TState> | null;

// A function that takes part of the state and returns a sub set of that state.
// Used to look for specific parts of the state that have changed.
export type Selector<TState> = (state: TState) => any;

// A function used to compare if two parts of the state have actually changed.
// By default a strict equals is used when comparing however sometimes something more complex is needed.
export type SelectorComparer<TState> = (prevValue: TState, newValue: TState) => boolean;

// A callback function to be triggered when a selector has returned a new value.
// The callback is given the new state and result of the selector that triggered the callback.
export type Subscription<TState> = (state: TState, newValue: any, triggeringModifier: Modifier<TState>, isNewState: boolean) => void;

// A function used to remove a subscription. This can be called multiple times.
export type RemoveSubscription = () => void;

// An item in the history. Keeps track of the modifier that created the state.
// A null modifier means the start of the history.
export interface HistoryItem<TState>
{
    readonly modifier: Modifier<TState> | null;
    readonly state: TState;
}

// An empty modifier, recommended to use when you want to return a modifier that does nothing.
export const EmptyModifier: Modifier<any> = () => null;

const EmptyFunction = () => {};

// Pairing of the selector function and subscription callback.
interface SubscriptionSelectorPair<TState>
{
    readonly selector: SelectorContext<TState>;
    readonly subscription: Subscription<TState>;
}

/**
 * The main data store class. Keeps track of the current state, any subscriptions and optionally a history of the state.
 *
 * By default history is disabled.
 */
export default class DataStore<TState>
{
    private currentState: TState;
    private subscriptions: Array<SubscriptionSelectorPair<TState>> = [];

    /**
     * Creates a new DataStore.
     *
     * @param initialState The starting values for the data store.
     */
    public constructor (initialState: TState)
    {
        this.currentState = initialState;
    }

    /**
     * Returns the current state.
     *
     * @returns The current state.
     */
    public state(): Readonly<TState>
    {
        return this.currentState;
    }

    /**
     * Executes a modifier on the state.
     * The modifier is recommended to return a partial state that is merged.
     *
     * If the modifier returns the same state (as compared with strict equals) or null then
     * the state is not updated nor is any subscription triggered.
     *
     * @param modifier Modifier function to update the state with.
     * @param isNewState Marks if this state is a new one. Can be used for history subscriptions to know if to record this state update or not.
     */
    public execute(modifier: Modifier<TState>, isNewState: boolean = true)
    {
        const newState = modifier(this.currentState);
        if (newState == null || newState === this.currentState)
        {
            return;
        }

        this.currentState = Object.assign({}, this.currentState, newState);
        this.triggerSubscriptions(modifier, isNewState);
    }

    /**
     * Subscribe to when a part of the state has changed. This will be called on all dispatches.
     *
     * @param selector A function for picking the values out of the store you want to check has changed.
     * @param subscription A callback that will be triggered when the values returned in the selector have changed.
     * @param comparer An optional comparer for old and new values.
     * @returns A function to remove the subscription from the store.
     */
    public subscribe (selector: Selector<TState>, subscription: Subscription<TState>, comparer: SelectorComparer<TState> = null): RemoveSubscription
    {
        const startValue = selector(this.currentState);
        const obj = { selector: new SelectorContext(selector, startValue, comparer), subscription };
        this.subscriptions.push(obj);

        let removed = false;
        return () =>
        {
            if (removed)
            {
                return;
            }

            const index = this.subscriptions.indexOf(obj);
            if (index >= 0)
            {
                this.subscriptions.splice(index, 1);
            }
            removed = true;
        };
    }

    /**
     * Adds a callback for anytime the store has changed.
     *
     * @param callback A callback for when the store has changed.
     * @returns A function to remove the subscription from the store.
     */
    public subscribeAny (callback: Subscription<TState>): RemoveSubscription
    {
        return this.subscribe((state) => state, callback);
    }

    /**
     * Removes all subscriptions.
     */
    public unsubscribeAll ()
    {
        this.subscriptions = [];
    }

    /**
     * Trigger all the subscriptions that an update has executed.
     *
     * @param isNewState Marks if this update is for a new state or not. Used by history subscriptions to know if to record the state change or not.
     */
    private triggerSubscriptions(modifier: Modifier<TState>, isNewState: boolean)
    {
        for (const subscription of this.subscriptions)
        {
            const newValue = subscription.selector.getValue(this.currentState);
            if (subscription.selector.checkIfChanged(newValue))
            {
                subscription.subscription(this.currentState, newValue, modifier, isNewState);
            }
        }
    }
}

/**
 * Class for simplifying keeping a history of state changes in a store.
 */
export class HistoryStore<TState>
{
    public readonly store: DataStore<TState>;
    public readonly limiter: number;

    private items: HistoryItem<TState>[] = [];
    private index: number = 0;
    private unsub: RemoveSubscription = EmptyFunction;
    private initialState: TState;

    constructor (store: DataStore<TState>, limiter: number = 100)
    {
        this.store = store;
        this.limiter = limiter;
        this.initialState = store.state();

        this.setEnabled(true);
        this.clear();
    }

    /**
     * Returns the current history index
     */
    public getIndex()
    {
        return this.index;
    }

    /**
     * Returns the list of history items.
     */
    public getItems(): Readonly<HistoryItem<TState>[]>
    {
        return this.items;
    }

    /**
     * Sets if the history is enabled or not.
     *
     * @param enabled Sets if the history is enabled or not.
     */
    public setEnabled(enabled: boolean)
    {
        this.unsub();
        if (enabled)
        {
            this.unsub = this.store.subscribeAny((state: TState, newValue: any, triggeringModifier: Modifier<TState>, isNewState: boolean) =>
            {
                if (!isNewState)
                {
                    return;
                }
                this.addToHistory(triggeringModifier, state);
            });
        }
        else
        {
            this.unsub = EmptyFunction;
        }
    }

    /**
     * Returns true if the history store is enabled or not.
     */
    public isEnabled()
    {
        return this.unsub !== EmptyFunction;
    }

    /**
     * Clears the history list. Back to storing just the initial state.
     */
    public clear()
    {
        this.items = [{modifier: null, state: this.initialState}];
        this.index = 0;
    }

    /**
     * Goes back one item in the history. If history is disabled or is at the start of the history nothing is triggered.
     */
    public back()
    {
        this.goto(this.index - 1);
    }

    /**
     * Goes forward one item in the history. If the history is disabled or at the most recent item nothing is triggered.
     */
    public forward()
    {
        this.goto(this.index + 1);
    }

    /**
     * Goes to the history index. If it is out of outs, the index is the same as the current one or history is disabled then nothing is trigged.
     *
     * @param index The history index to go to.
     */
    public goto(index: number)
    {
        if (index < 0 || index >= this.items.length || index === this.index)
        {
            return;
        }

        this.index = index;

        const historyItem = this.items[this.index].state;
        this.store.execute((state) => historyItem, false);
    }


    /**
     * Pushes a new history item into the history list.
     * If the history index is not at the most current then those are removed.
     * Also checks if the history is getting too long.
     *
     * @param historyState The history item to add.
     */
    private addToHistory(triggeringModifier: Modifier<TState>, historyState: TState)
    {
        if (this.index < this.items.length - 1)
        {
            this.items.splice(this.index, this.items.length);
        }
        this.items.push({state: historyState, modifier: triggeringModifier});
        this.index = this.items.length - 1;

        if (this.limiter > 0 && this.items.length > this.limiter + 10)
        {
            this.items.splice(0, 10);
            this.index -= 10;
        }
    }
}

/**
 * A selector context is a pairing of a selector function, a comparer and a previous value.
 * This is used to actual keep track of when something has changed and the way to compare the change.
 *
 * NOTE: Not indented to be a public class.
 */
class SelectorContext<TState>
{
    public readonly selector: Selector<TState>;
    public readonly comparer: SelectorComparer<TState>;
    public prevValue: any;

    constructor (selector: Selector<TState>, startValue: any = undefined, comparer: SelectorComparer<TState> = null)
    {
        this.selector = selector;
        this.prevValue = startValue;
        this.comparer = comparer;
    }

    /**
     * Select the value from the state using the selector function provided.
     *
     * @param state The state to get the value from.
     * @returns Whatever the selector returns.
     */
    public getValue (state: TState): any
    {
        return this.selector(state);
    }

    /**
     * Check if the new value is different from the old one using the comparer.
     *
     * @param newValue The new value from the selector.
     */
    public checkIfChanged (newValue: any): boolean
    {
        let result = false;
        if (this.comparer != null)
        {
            result = !this.comparer(this.prevValue, newValue);
        }
        else
        {
            result = newValue !== this.prevValue;
        }

        this.prevValue = newValue;
        return result;
    }
}