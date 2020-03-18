export declare type Modifier<TState> = (state: TState) => Partial<TState> | null;
export declare type Selector<TState, TValue> = (state: TState) => TValue;
export declare type SelectorComparer<TValue> = (prevValue: TValue, newValue: TValue) => boolean;
export declare type Subscription<TState, TValue> = (state: TState, newValue: TValue, triggeringModifier: Modifier<TState>, isNewState: boolean) => void;
export declare type RemoveSubscription = () => void;
export declare const EmptyModifier: Modifier<any>;
/**
 * The main data store class. Keeps track of the current state, any subscriptions and optionally a history of the state.
 *
 * By default history is disabled.
 */
export default class DataStore<TState> {
    private currentState;
    private subscriptions;
    /**
     * Creates a new DataStore.
     *
     * @param initialState The starting values for the data store.
     */
    constructor(initialState: TState);
    /**
     * Returns the current state.
     *
     * @returns The current state.
     */
    state(): Readonly<TState>;
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
    execute(modifier: Modifier<TState>, isNewState?: boolean): void;
    /**
     * Subscribe to when a part of the state has changed. This will be called on all dispatches.
     *
     * @param selector A function for picking the values out of the store you want to check has changed.
     * @param subscription A callback that will be triggered when the values returned in the selector have changed.
     * @param comparer An optional comparer for old and new values, these values will the old and new results from the selector, *NOT* the state as a whole.
     * @param selectorName An optional name to link with the selector to help with debugging.
     * @returns A function to remove the subscription from the store.
     */
    subscribe<TValue>(selector: Selector<TState, TValue>, subscription: Subscription<TState, TValue>, comparer?: SelectorComparer<TValue>, selectorName?: string): RemoveSubscription;
    /**
     * Adds a callback for anytime the store has changed.
     *
     * @param callback A callback for when the store has changed.
     * @param selectorName An optional name to link with the selector to help with debugging.
     * @returns A function to remove the subscription from the store.
     */
    subscribeAny(callback: Subscription<TState, TState>, selectorName?: string): RemoveSubscription;
    /**
     * Removes all subscriptions.
     */
    unsubscribeAll(): void;
    /**
     * Trigger all the subscriptions that an update has executed.
     *
     * @param isNewState Marks if this update is for a new state or not. Used by history subscriptions to know if to record the state change or not.
     */
    private triggerSubscriptions;
}
