export abstract class BaseReducer<TState, TAction>
{
    public readonly actionType: string;

    /**
     * Create the base reducers actionType.
     *
     * @param actionType The string identifier for the action this reducer will act on.
     */
    constructor(actionType: string)
    {
        this.actionType = actionType;
    }

    /**
     * Execute this reducer with a state and action.
     *
     * @param state The current state of the data store.
     * @param action The action trigger to modify the store.
     */
    public abstract execute (state: TState, action: TAction & Action): TState;

    /**
     * Helper function for creating actions that will trigger this reducer.
     *
     * @returns A new object that has the data of the original action combined with
     */
    public createAction(data: TAction): Action & TAction
    {
        return { ...data, type: this.actionType };
    }
}

export type Selector<TState> = (state: TState) => any;
export type SelectorComparer<TState> = (prevValue: TState, newValue: TState) => boolean;
export class SelectorContext<TState>
{
    public readonly func: Selector<TState>;
    public readonly comparer: SelectorComparer<TState>;
    public prevValue: any;

// tslint:disable-next-line: no-unnecessary-initializer
    constructor (func: Selector<TState>, startValue: any = undefined, comparer: SelectorComparer<TState> = null)
    {
        this.func = func;
        this.prevValue = startValue;
        this.comparer = comparer;
    }

    public getValue (state: TState): any
    {
        return this.func(state);
    }

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

export type Callback<TState> = (state: TState, newValue: any) => void;
export type RemoveCallback = () => void;
export type RemoveReducer = () => void;
export interface Action
{
    type: string;
}

export default class DataStore<TState>
{
    private currentState: TState;
    private reducers: { [actionType: string]: BaseReducer<TState, any> } = {};
    private callbacks: Array<{selector: SelectorContext<TState>, callback: Callback<TState>}>  = [];

    constructor (initialState: TState)
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
     * Removes all subscriptions and reducers from the store.
     *
     * Mostly used for tests where you want to remove all references to the store.
     */
    public removeAll ()
    {
        this.callbacks = [];
        this.reducers = {};
    }

    /**
     * Adds a reducer instance into the store.
     * Will throw an error if the store already has a reducer with the same action type.
     *
     * @param reducer A reducer instance.
     * @returns A callback for removing a reducer from the store.
     */
    public addReducer (reducer: BaseReducer<TState, any>): RemoveReducer
    {
        if (this.reducers[reducer.actionType])
        {
            throw new Error('A reducer wit the same type is already in this store.');
        }
        this.reducers[reducer.actionType] = reducer;

        let removed = false;
        return function ()
        {
            if (removed)
            {
                return;
            }

            delete this.reducers[reducer.actionType];
            removed = true;
        };
    }

    /**
     * Dispatch the action if the action is not null or undefined.
     *
     * @param action An action or undefined or null to dispatch.
     */
    public tryDispatch (action?: Action)
    {
        if (action != null)
        {
            this.dispatch(action);
        }
    }

    /**
     * Dispatch the action. If there is no reducer for the given action it will be ignored.
     *
     * @param action The action to dispatch.
     */
    public dispatch (action: Action)
    {
        const reducer = this.reducers[action.type];

        if (!reducer)
        {
            console.error('Unable to find reducer for action', action);
        }
        else
        {
            this.currentState = reducer.execute(this.currentState, action);
        }

        for (const callback of this.callbacks)
        {
            const newValue = callback.selector.getValue(this.currentState);
            if (callback.selector.checkIfChanged(newValue))
            {
                callback.callback(this.currentState, newValue);
            }
        }
    }

    /**
     * Subscribe to when a part of the state has changed. This will be called on all dispatches.
     *
     * @param selector A function for picking the values out of the store you want to check has changed.
     * @param callback A callback that will be triggered when the values returned in the selector have changed.
     * @param comparer An optional comparer for old and new values.
     * @returns A function to remove the subscription from the store.
     */
    public subscribe (selector: Selector<TState>, callback: Callback<TState>, comparer: SelectorComparer<TState> = null): RemoveCallback
    {
        const startValue = selector(this.currentState);
        const obj = { selector: new SelectorContext(selector, startValue, comparer), callback };
        this.callbacks.push(obj);

        let removed = false;
        return () =>
        {
            if (removed)
            {
                return;
            }

            const index = this.callbacks.indexOf(obj);
            if (index >= 0)
            {
                this.callbacks.splice(index, 1);
            }
            removed = true;
        };
    }

    /**
     * Adds a callback for anytime the store has changed.
     * @param callback A callback for when the store has changed.
     * @returns A function to remove the subscription from the store.
     */
    public subscribeAny (callback: Callback<TState>): RemoveCallback
    {
        return this.subscribe((state) => state, callback);
    }
}
