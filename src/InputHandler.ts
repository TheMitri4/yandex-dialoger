import { SetState } from './SetState';
import { Input } from './Input';

export type InputHandler<TState, TSceneId> = (
    input: Input,
    state: TState,
    setState: SetState<TState>
) => TSceneId | undefined | Promise<TSceneId | undefined>;
