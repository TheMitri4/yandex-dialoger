import { SetState } from './SetState';
import { Startable } from './Startable';

export type TransitionHandler<TState, TSceneId> = (
    state: TState,
    setState: SetState<TState>
) => Startable<TSceneId> | Promise<Startable<TSceneId>>;
