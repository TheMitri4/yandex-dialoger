import { Startable } from './Startable';

export type SessionState<TState, TSceneId> = {
    state: TState;
    $currentScene: Startable<TSceneId>;
};
