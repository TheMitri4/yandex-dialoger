import { createDialog, createTestClosure } from '../src/index';

/**
 * Наш навык
 */
const dialog = createDialog({
    scenes: {
        Start: {
            reply: (reply) => reply.withText('Привет.'),
            onInput: () => 'Start',
        },
    },
});

/**
 * Тесты
 */
test('Hello world', async () => {
    const closure = createTestClosure(dialog);

    const { text } = await closure.handleCommand('');

    expect(text).toBe('Привет.');
});
