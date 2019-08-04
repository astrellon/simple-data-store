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

// An empty modifier, recommended to use when you want to return a modifier that does nothing.
export const EmptyModifier: Modifier<any> = () => null;

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
        if (newState === null || newState === undefined || newState === this.currentState)
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
    public subscribe (selector: Selector<TState>, subscription: Subscription<TState>, comparer?: SelectorComparer<TState>): RemoveSubscription
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
 * A selector context is a pairing of a selector function, a comparer and a previous value.
 * This is used to actual keep track of when something has changed and the way to compare the change.
 *
 * NOTE: Not indented to be a public class.
 */
class SelectorContext<TState>
{
    public readonly selector: Selector<TState>;
    public readonly comparer?: SelectorComparer<TState>;
    private prevValue: any;

    constructor (selector: Selector<TState>, startValue: any = undefined, comparer?: SelectorComparer<TState>)
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
        if (this.comparer !== undefined)
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