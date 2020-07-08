import { Dialog } from './Dialog';
import { RequestHandler } from './RequestHandler';
import { DialogParams } from './DialogParams';
import { TestClosure } from './TestClosure';

export function createDialog<TSceneId extends string, TState extends object>(
    params: DialogParams<TState, TSceneId>
): RequestHandler;

/**
 * В этой версии можно не передавать state, но тип TState будет {}
 */
export function createDialog<TSceneId extends string>(
    params: Omit<DialogParams<{}, TSceneId>, 'state'>
): RequestHandler;

export function createDialog<TSceneId extends string>(
    params: Omit<DialogParams<{}, TSceneId>, 'state'>
): RequestHandler {
    const dialog = new Dialog({ state: () => ({}), ...params });

    return dialog.handleRequest.bind(dialog);
}

export function createTestClosure(handler: RequestHandler): TestClosure {
    return new TestClosure(handler);
}

export { startServer as startServer } from './startServer';
