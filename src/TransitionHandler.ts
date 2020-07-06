import { SetState } from './SetState';

export type TransitionHandler<TState, TSceneId> = (
    state: TState,
    setState: SetState<TState>
) => TSceneId | Promise<TSceneId>;
