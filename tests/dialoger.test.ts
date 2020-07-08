import { createDialog, createTestClosure } from '../src/index';

/**
 * Hello world
 */
test('Я в порядке', async () => {
    const closure = createTestClosure(
        createDialog({
            scenes: {
                Start: {
                    reply: (reply) => reply.withText('Привет.'),
                    onInput: () => 'Start',
                },
            },
        })
    );

    const { text } = await closure.handleCommand('');

    expect(text).toBe('Привет.');
});
