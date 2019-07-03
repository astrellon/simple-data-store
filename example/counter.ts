import { SimpleState } from './sample';
import { Modifier } from '../src';

export function inc()
{
    return (state: SimpleState) => ({ counter: state.counter + 1 });
}

export function dec()
{
    return (state: SimpleState) => ({ counter: state.counter - 1 });
}