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
export type Subscription<TState> = (state: TState, newValue: any) => void;

// A function used to remove a subscription. This can be called multiple times.
export type RemoveSubscription = () => void;

// An item in the history. Keeps track of the modifier that created the state.
// A null modifier means the start of the history.
export interface HistoryItem<TState>
{
    readonly modifier: Modifier<TState> | null;
    readonly state: TState;
}

// An object that outlines the current state of the history.
export interface HistoryState<TState>
{
    readonly items: HistoryItem<TState>[];
    readonly limiter: number;
    readonly index: number;
    readonly enabled: boolean;
}

// An empty modifier, recommended to use when you want to return a modifier that does nothing.
export const EmptyModifier: Modifier<any> = () => null;

/**
 * The main data store class. Keeps track of the current state, any subscriptions and optionally a history of the state.
 *
 * By default history is disabled.
 */
export default class DataStore<TState>
{
    private currentState: TState;
    private subscriptions: Array<{selector: SelectorContext<TState>, subscription: Subscription<TState>}>  = [];
    private history: HistoryItem<TState>[] = [];
    private historyIndex: number = 0;
    private enableHistory: boolean = false;
    private historyLimiter: number = 100;

    constructor (initialState: TState)
    {
        this.currentState = initialState;
        this.history.push({modifier: null, state: this.currentState});
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
     */
    public execute(modifier: Modifier<TState>)
    {
        const newState = modifier(this.currentState);
        if (newState == null || newState === this.currentState)
        {
            return;
        }

        this.updateState(Object.assign({}, this.currentState, newState));

        if (this.enableHistory)
        {
            this.addToHistory({modifier: modifier, state: this.currentState});
        }
    }

    /**
     * Sets if history is enabled or not.
     * There is a small performance penalty for using it and some amount of memory depending on the limiter.
     * A history limiter of 0 (zero) or less means no limit.
     *
     * NOTE: The limiter is not a hard limit, but items will not be removed if the history length is less than the limiter.
     *
     * @param enable Enable recording history.
     * @param historyLimiter Sets the limiter on the number of history items..
     */
    public setEnableHistory(enable: boolean, historyLimiter?: number)
    {
        this.enableHistory = enable;
        if (typeof(historyLimiter) === 'number' && !isNaN(historyLimiter))
        {
            this.historyLimiter = historyLimiter;
        }

        if (!enable)
        {
            this.history = [];
            this.historyIndex = 0;
        }
    }

    /**
     * Returns information about the history state.
     *
     * @returns An object defining the history state.
     */
    public getHistory(): HistoryState<TState>
    {
        return {
            items: this.history,
            limiter: this.historyLimiter,
            index: this.historyIndex,
            enabled: this.enableHistory
        }
    }

    /**
     * Clears the history list.
     */
    public clearHistory()
    {
        this.history = [];
        this.historyIndex = 0;
    }

    /**
     * Goes back one item in the history. If history is disabled or is at the start of the history nothing is triggered.
     */
    public historyBack()
    {
        this.historyGoto(this.historyIndex - 1);
    }

    /**
     * Goes forward one item in the history. If the history is disabled or at the most recent item nothing is triggered.
     */
    public historyForward()
    {
        this.historyGoto(this.historyIndex + 1);
    }

    /**
     * Goes to the history index. If it is out of outs, the index is the same as the current one or history is disabled then nothing is trigged.
     *
     * @param index The history index to go to.
     */
    public historyGoto(index: number)
    {
        if (!this.enableHistory || index < 0 || index >= this.history.length || index === this.historyIndex)
        {
            return;
        }

        this.historyIndex = index;
        this.updateState(this.history[this.historyIndex].state);
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
     * Updates the current state and triggers any subscriptions.
     *
     * NOTE: Does not check if the state is the same.
     *
     * @param state The new state to set as the current.
     */
    private updateState(state: TState)
    {
        this.currentState = state;

        for (const subscription of this.subscriptions)
        {
            const newValue = subscription.selector.getValue(this.currentState);
            if (subscription.selector.checkIfChanged(newValue))
            {
                subscription.subscription(this.currentState, newValue);
            }
        }
    }

    /**
     * Pushes a new history item into the history list.
     * If the history index is not at the most current then those are removed.
     * Also checks if the history is getting too long.
     *
     * @param historyItem The history item to add.
     */
    private addToHistory(historyItem: HistoryItem<TState>)
    {
        if (this.historyIndex < this.history.length - 1)
        {
            this.history.splice(this.historyIndex, this.history.length);
        }
        this.history.push(historyItem);
        this.historyIndex = this.history.length - 1;

        if (this.historyLimiter > 0 && this.history.length > this.historyLimiter + 10)
        {
            this.history.splice(0, 10);
            this.historyIndex -= 10;
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
