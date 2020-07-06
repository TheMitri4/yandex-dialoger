import { ReplyHandler } from './ReplyHandler';
import { ReplyBuilder } from './ReplyBuilder';
import { SessionState } from './SessionState';
import { Input } from './Input';
import { InputHandler } from './InputHandler';

export class SceneProcessor<TState, TSceneId> {
    constructor(
        private readonly inputHandler: InputHandler<TState, TSceneId>,
        private readonly replyHandler?: ReplyHandler<TState>,
        private readonly helpHandler?: ReplyHandler<TState>,
        private readonly unrecognizedHandler?: ReplyHandler<TState>
    ) {}

    applyReply = (replyBuilder: ReplyBuilder, state: TState): void => {
        if (this.replyHandler) {
            this.replyHandler(replyBuilder, state);
        }
    };

    hasReply(): boolean {
        return Boolean(this.replyHandler);
    }

    applyHelp = (replyBuilder: ReplyBuilder, state: TState): void => {
        const handler = this.helpHandler ?? this.unrecognizedHandler ?? this.replyHandler;

        if (handler) {
            handler(replyBuilder, state);
        }
    };

    applyUnrecognized = (replyBuilder: ReplyBuilder, state: TState): void => {
        const handler = this.unrecognizedHandler ?? this.helpHandler ?? this.replyHandler;

        if (handler) {
            handler(replyBuilder, state);
        }
    };

    async applyInput(
        inputData: Input,
        state: TState
    ): Promise<SessionState<TState, TSceneId | undefined>> {
        const patches: Partial<TState>[] = [];

        const nextSceneId = await this.inputHandler(inputData, state, (patch) =>
            patches.push(patch)
        );

        return {
            state: Object.assign({}, state, ...patches),
            $currentScene: nextSceneId,
        };
    }
}
