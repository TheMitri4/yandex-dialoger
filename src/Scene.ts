import { InputHandler } from './InputHandler';
import { ReplyHandler } from './ReplyHandler';

export interface Scene<TState, TSceneId> {
    reply?: ReplyHandler<TState>;
    help?: ReplyHandler<TState>;
    unrecognized?: ReplyHandler<TState>;
    onInput: InputHandler<TState, TSceneId>;
}
