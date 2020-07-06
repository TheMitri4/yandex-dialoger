import { ReplyHandler } from './ReplyHandler';
import { ReplyBuilder } from './ReplyBuilder';
import { SessionState } from './SessionState';
import { TransitionHandler } from './TransitionHandler';

export class TransitionProcessor<TState, TSceneId> {
    constructor(
        private readonly transitionHandler: TransitionHandler<TState, TSceneId>,
        private readonly replyHandler?: ReplyHandler<TState>
    ) {}

    applyReply = (replyBuilder: ReplyBuilder, state: TState): void => {
        if (this.replyHandler) {
            this.replyHandler(replyBuilder, state);
        }
    };

    hasReply(): boolean {
        return Boolean(this.replyHandler);
    }

    async applyTransition(state: TState): Promise<SessionState<TState, TSceneId>> {
        const patches: Partial<TState>[] = [];
        const nextSceneId = await this.transitionHandler(state, (patch) => patches.push(patch));

        return {
            state: Object.assign({}, state, ...patches),
            $currentScene: nextSceneId,
        };
    }
}
