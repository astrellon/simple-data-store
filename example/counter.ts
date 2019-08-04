import { SimpleState } from './sample';

export function inc()
{
    return (state: SimpleState) => ({ counter: state.counter + 1 });
}

export function dec()
{
    return (state: SimpleState) => ({ counter: state.counter - 1 });
}