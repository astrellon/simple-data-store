// A function to create a patch for the state.
// Meaning this should return a partial state to be merged with the current state.
export type Modifier<TState> = (state: TState) => Partial<TState> | null;

// A callback function to be triggered when a selector has returned a new value.
// The callback is given the new state and result of the selector that triggered the callback.
export type Subscription<TState> = (state: TState, triggeringModifier: Modifier<TState>, isNewState: boolean) => void;

export default <TState extends {}>(state: TState, subscription: Subscription<TState>) =>
{
    return (modifier: Modifier<TState>, isNewState: boolean = true) =>
    {
        const newState = modifier(state);
        if (newState == null || newState === state)
        {
            return;
        }

        state = Object.assign({}, state, newState);
        subscription(state, modifier, isNewState);
    }
}