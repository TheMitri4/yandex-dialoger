import { ReplyBuilder } from './ReplyBuilder';
import { SessionState } from './SessionState';
import { SceneProcessor } from './SceneProcessor';
import { DialogRequest } from './DialogRequest';
import { DialogResponse } from './DialogResponse';
import { DialogBuildinIntent } from './DialogBuildinIntent';
import { Input } from './Input';
import { ReplyHandler } from './ReplyHandler';
import { TransitionProcessor } from './TransitionProcessor';
import { Scene } from './Scene';
import { Transition } from './Transition';
import { RequestHandler } from './RequestHandler';
import { DialogParams } from './DialogParams';
import { Startable } from './Startable';

/**
 * @param TState
 *  Состояние будет доступно в методах определения сцены
 *  Важно: состояние должно сериализоваться и десериализоваться через JSON. Т.е. нельзя использовать классы с методами.
 * @param TSceneId Можно указать список возможных сцен чтобы исключить случайную ошибку при их определении
 */
export class Dialog<TState extends object, TSceneId extends string> {
    private readonly scenes: Map<Startable<TSceneId>, SceneProcessor<TState, TSceneId>> = new Map();
    private readonly transitions: Map<
        Startable<TSceneId>,
        TransitionProcessor<TState, TSceneId>
    > = new Map();
    private readonly initialState: () => TState;
    private readonly whatCanYouDoHandler: ReplyHandler<TState>;

    constructor({
        scenes,
        state,
        whatCanYouDo: whatCanYouDoHandler,
    }: DialogParams<TState, TSceneId>) {
        this.initialState = state;
        this.whatCanYouDoHandler = whatCanYouDoHandler ?? (() => {});

        for (let sceneId of Object.keys(scenes) as TSceneId[]) {
            const decl = scenes[sceneId];

            if (this.isScene<TState, TSceneId>(decl)) {
                this.scenes.set(
                    sceneId,
                    new SceneProcessor<TState, TSceneId>(
                        decl.onInput,
                        decl.reply,
                        decl.help,
                        decl.unrecognized
                    )
                );

                continue;
            }

            if (this.isTransition<TState, TSceneId>(decl)) {
                this.transitions.set(
                    sceneId,
                    new TransitionProcessor(decl.onTransition, decl.reply)
                );
                continue;
            }

            throw new Error(`Элемент ${sceneId} не был распознан ни как сцена ни как переход.`);
        }
    }

    handleRequest(request: DialogRequest): Promise<DialogResponse> {
        if (this.isPingRequest(request)) {
            return this.handlePing();
        }

        return this.handleUserRequest(request);
    }

    private isPingRequest(request: DialogRequest) {
        return request.request.original_utterance.includes('ping');
    }

    private handlePing(): Promise<DialogResponse> {
        return Promise.resolve({
            response: { text: 'pong', end_session: true },
            version: '1.0',
        });
    }

    private async handleUserRequest(request: DialogRequest): Promise<DialogResponse> {
        const {
            command,
            nlu: { intents },
        } = request.request;

        const reply = new ReplyBuilder();
        const context = this.getOrCreateSessionState(request);

        /**
         * При начале новой сессии, если у первой сцены (или перехода) есть reply,
         * то отрабатываем его, а не onInput. Так не придётся стартовой
         * делать сцену с одним только пустым onInput (если это нам не нужно).
         */
        const node =
            this.findTransition(context.$currentScene) ?? this.getScene(context.$currentScene);

        if (request.session.new && node.hasReply()) {
            return await this.applyTransitionsAndScene(context, reply);
        }

        const scene = this.getScene(context.$currentScene);

        const inputData: Input = {
            command: command.toLowerCase(),
            intents,
            request,
            isConfirm: intents && intents.hasOwnProperty(DialogBuildinIntent.Confirm),
            isReject: intents && intents.hasOwnProperty(DialogBuildinIntent.Reject),
        };

        if (intents) {
            /**
             * Обработка запроса «Помощь» и «Что ты умеешь»
             */
            if (inputData.intents[DialogBuildinIntent.Help]) {
                scene.applyHelp(reply, context.state);

                return reply.build(context);
            }

            if (inputData.intents[DialogBuildinIntent.WhatCanYouDo]) {
                this.whatCanYouDoHandler(reply, context.state);
                scene.applyHelp(reply, context.state);

                return reply.build(context);
            }

            /**
             * Обработка запроса «Повтори» и подобных
             */
            if (inputData.intents[DialogBuildinIntent.Repeat]) {
                scene.applyReply(reply, context.state);
                return reply.build(context);
            }
        }

        const contextAfterInput = await scene.applyInput(inputData, context.state);

        /**
         * Unrecognized
         *
         * Обработка нераспознанного запроса, когда onInput возвращает undefined.
         * Добавляем unrecognized-ответ текущей сцены.
         * Состояние после onInput сохраняем, а $currentScene оставляем как был.
         */
        if (!contextAfterInput.$currentScene) {
            scene.applyUnrecognized(reply, context.state);

            return reply.build({
                state: contextAfterInput.state,
                $currentScene: context.$currentScene,
            });
        }

        this.assertSessionHasSceneId(contextAfterInput);
        return await this.applyTransitionsAndScene(contextAfterInput, reply);
    }

    private getOrCreateSessionState(request: DialogRequest): SessionState<TState, TSceneId> {
        const sessionState = request.state && request.state.session;

        if (this.isNotEmptySessionState(sessionState)) {
            return sessionState;
        }

        return {
            state: this.initialState(),
            $currentScene: 'Start',
        };
    }

    /**
     * Попадаем сюда после отработки функции onInput.
     * Здесь мы отрабатываем переходы (transition), если они есть и
     * reply у достигнутой таким образом цвены.
     */
    private async applyTransitionsAndScene(
        context: SessionState<TState, TSceneId>,
        reply: ReplyBuilder
    ) {
        const context2 = await this.applyTransitions(context, reply);

        const scene = this.getScene(context2.$currentScene);
        scene.applyReply(reply, context2.state);

        return reply.build(context2);
    }

    private async applyTransitions(
        context: SessionState<TState, TSceneId>,
        output: ReplyBuilder
    ): Promise<SessionState<TState, TSceneId>> {
        const scene = this.findTransition(context.$currentScene);

        if (!scene) {
            return context;
        }

        scene.applyReply(output, context.state);
        return this.applyTransitions(await scene.applyTransition(context.state), output);
    }

    private findTransition(sceneName: Startable<TSceneId>) {
        return this.transitions.get(sceneName);
    }

    private getScene(SceneId: Startable<TSceneId>): SceneProcessor<TState, TSceneId> {
        const scene = this.scenes.get(SceneId);

        if (!scene) {
            throw new Error(`Сцена ${SceneId} не определена.`);
        }

        return scene;
    }

    private isNotEmptySessionState(
        sessionState: SessionState<TState, TSceneId> | {}
    ): sessionState is SessionState<TState, TSceneId> {
        return sessionState && '$currentScene' in sessionState && 'state' in sessionState;
    }

    private isScene<TState, TSceneId>(decl: any): decl is Scene<TState, TSceneId> {
        return typeof decl.onInput === 'function';
    }

    private isTransition<TState, TSceneId>(decl: any): decl is Transition<TState, TSceneId> {
        return typeof decl.onTransition === 'function';
    }

    private assertSessionHasSceneId<TState, TSceneId>(
        sessionState: SessionState<TState, TSceneId | undefined>
    ): asserts sessionState is SessionState<TState, TSceneId> {
        if (typeof sessionState.$currentScene !== 'string') {
            throw new Error('sessionState не содержит sceneId');
        }
    }
}
