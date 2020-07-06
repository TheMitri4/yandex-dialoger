import { ReplyHandler } from './ReplyHandler';
import { TransitionHandler } from './TransitionHandler';

export interface Transition<TState, TSceneId> {
    reply?: ReplyHandler<TState>;
    onTransition: TransitionHandler<TState, TSceneId>;
}
