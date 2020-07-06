import { SetState } from './SetState';
import { Input } from './Input';
import { Startable } from './Startable';

export type InputHandler<TState, TSceneId> = (
    input: Input,
    state: TState,
    setState: SetState<TState>
) => Startable<TSceneId> | undefined | Promise<Startable<TSceneId> | undefined>;
