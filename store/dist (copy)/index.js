"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// An empty modifier, recommended to use when you want to return a modifier that does nothing.
exports.EmptyModifier = () => null;
/**
 * The main data store class. Keeps track of the current state, any subscriptions and optionally a history of the state.
 *
 * By default history is disabled.
 */
class DataStore {
    /**
     * Creates a new DataStore.
     *
     * @param initialState The starting values for the data store.
     */
    constructor(initialState) {
        this.subscriptions = [];
        this.currentState = initialState;
    }
    /**
     * Returns the current state.
     *
     * @returns The current state.
     */
    state() {
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
    execute(modifier, isNewState = true) {
        const newState = modifier(this.currentState);
        if (newState === null || newState === undefined || newState === this.currentState) {
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
     * @param comparer An optional comparer for old and new values, these values will the old and new results from the selector, *NOT* the state as a whole.
     * @param selectorName An optional name to link with the selector to help with debugging.
     * @returns A function to remove the subscription from the store.
     */
    subscribe(selector, subscription, comparer, selectorName) {
        const startValue = selector(this.currentState);
        const obj = { selector: new SelectorContext(selector, startValue, comparer, selectorName), subscription };
        this.subscriptions.push(obj);
        let removed = false;
        return () => {
            if (removed) {
                return;
            }
            const index = this.subscriptions.indexOf(obj);
            if (index >= 0) {
                this.subscriptions.splice(index, 1);
            }
            removed = true;
        };
    }
    /**
     * Adds a callback for anytime the store has changed.
     *
     * @param callback A callback for when the store has changed.
     * @param selectorName An optional name to link with the selector to help with debugging.
     * @returns A function to remove the subscription from the store.
     */
    subscribeAny(callback, selectorName) {
        return this.subscribe((state) => state, callback, undefined, selectorName);
    }
    /**
     * Removes all subscriptions.
     */
    unsubscribeAll() {
        this.subscriptions = [];
    }
    /**
     * Trigger all the subscriptions that an update has executed.
     *
     * @param isNewState Marks if this update is for a new state or not. Used by history subscriptions to know if to record the state change or not.
     */
    triggerSubscriptions(modifier, isNewState) {
        for (const subscription of this.subscriptions) {
            const newValue = subscription.selector.getValue(this.currentState);
            if (subscription.selector.checkIfChanged(newValue)) {
                subscription.subscription(this.currentState, newValue, modifier, isNewState);
            }
        }
    }
}
exports.default = DataStore;
/**
 * A selector context is a pairing of a selector function, a comparer and a previous value.
 * This is used to actual keep track of when something has changed and the way to compare the change.
 *
 * NOTE: Not indented to be a public class.
 */
class SelectorContext {
    constructor(selector, startValue = undefined, comparer, name) {
        this.selector = selector;
        this.prevValue = startValue;
        this.comparer = comparer;
        this.name = name;
    }
    /**
     * Select the value from the state using the selector function provided.
     *
     * @param state The state to get the value from.
     * @returns Whatever the selector returns.
     */
    getValue(state) {
        return this.selector(state);
    }
    /**
     * Check if the new value is different from the old one using the comparer.
     *
     * @param newValue The new value from the selector.
     */
    checkIfChanged(newValue) {
        let result = false;
        if (this.comparer !== undefined) {
            result = !this.comparer(this.prevValue, newValue);
        }
        else {
            result = newValue !== this.prevValue;
        }
        this.prevValue = newValue;
        return result;
    }
}
//# sourceMappingURL=index.js.map