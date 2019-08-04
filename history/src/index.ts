import DataStore, { Modifier, RemoveSubscription } from "simple-data-store";

// A callback function to be triggered when a new history item is added.
export type HistorySubscription<TState> = (triggeringModifier: Modifier<TState>, historyState: TState) => void;

// An item in the history. Keeps track of the modifier that created the state.
// A null modifier means the start of the history.
export interface HistoryItem<TState>
{
    readonly modifier: Modifier<TState> | null;
    readonly state: TState;
}

const EmptyFunction = () => {};

/**
 * Class for simplifying keeping a history of state changes in a store.
 */
export default class HistoryStore<TState>
{
    public readonly store: DataStore<TState>;
    public readonly limiter: number;

    private items: HistoryItem<TState>[] = [];
    private index: number = 0;
    private unsub: RemoveSubscription = EmptyFunction;
    private initialState: TState;
    private subscriptions: HistorySubscription<TState>[] = [];

    /**
     * Create a new history store that will keep track of all changes made to the given store.
     *
     * @param store The DataStore that this store will keep history of.
     * @param limiter A limiter to the maximum number of items to keep. A value of zero will keep all items.
     */
    constructor (store: DataStore<TState>, limiter: number = 100)
    {
        this.store = store;
        this.limiter = limiter;
        this.initialState = store.state();

        this.setEnabled(true);
        this.clear();
    }

    /**
     * Subscribe a callback to be triggered when a new history item is added.
     *
     * @param subscription A callback to be trigger when a new history item is added.
     * @returns A function to remove the subscription from the store.
     */
    public subscribe(subscription: HistorySubscription<TState>): RemoveSubscription
    {
        this.subscriptions.push(subscription);

        let removed = false;
        return () =>
        {
            if (removed)
            {
                return;
            }

            const index = this.subscriptions.indexOf(subscription);
            if (index >= 0)
            {
                this.subscriptions.splice(index, 1);
            }
            removed = true;
        };
    }

    /**
     * Returns the current history index
     */
    public getIndex()
    {
        this.checkTrimHistory(0);
        return this.index;
    }

    /**
     * Returns the list of history items.
     */
    public getItems(): Readonly<HistoryItem<TState>[]>
    {
        this.checkTrimHistory(0);
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
     * @param triggeringModifier The modifier that triggered this change.
     * @param historyState The history item to add.
     */
    private addToHistory(triggeringModifier: Modifier<TState>, historyState: TState)
    {
        if (this.index < this.items.length - 1)
        {
            this.items.splice(this.index + 1, this.items.length);
        }
        this.items.push({state: historyState, modifier: triggeringModifier});
        this.index = this.items.length - 1;

        this.checkTrimHistory(10);

        for (const listener of this.subscriptions)
        {
            listener(triggeringModifier, historyState);
        }
    }

    /**
     * Checks if the number of history items has gone past the limiter.
     * The padding lets the history only be trimmed if it's really too far.
     *
     * @param allowedPadding Amount of allowed extra items in the history.
     */
    private checkTrimHistory(allowedPadding: number)
    {
        if (this.limiter > 0 && this.items.length > this.limiter + allowedPadding)
        {
            const overflow = this.items.length - this.limiter;
            this.items.splice(0, overflow);
            this.index -= overflow;
        }
    }
}
