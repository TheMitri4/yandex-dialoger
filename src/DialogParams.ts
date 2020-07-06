import { ReplyHandler } from './ReplyHandler';
import { Scene } from './Scene';
import { Transition } from './Transition';
import { Startable } from './Startable';

export interface DialogParams<TState extends object, TSceneId extends string> {
    scenes: Record<Startable<TSceneId>, Scene<TState, TSceneId> | Transition<TState, TSceneId>>;
    state: () => TState;
    whatCanYouDo?: ReplyHandler<TState>;
}
