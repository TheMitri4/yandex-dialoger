import { RequestHandler } from './RequestHandler';

export class TestClosure {
    private state!: {};
    private isNew: boolean = true;

    constructor(private readonly requestHandler: RequestHandler) {}

    async handleCommand(command: string) {
        return await this.handleRequest(command);
    }

    async handleIntent(intent: string) {
        return await this.handleRequest('', intent);
    }

    private async handleRequest(command: string, intent?: string) {
        const response = await this.requestHandler({
            meta: {
                locale: 'ru-RU',
                timezone: 'Europe/Moscow',
            },
            request: {
                command: command,
                original_utterance: command,
                markup: {
                    dangerous_context: false,
                },
                nlu: {
                    tokens: command.split(' '),
                    intents: intent ? { [intent]: { slots: {} } } : {},
                },
            },
            state: {
                session: this.state,
            },
            session: {
                new: this.isNew,
                message_id: 1,
                session_id: '2eac4854-fce721f3-b845abba-20d60',
                skill_id: '3ad36498-f5rd-4079-a14b-788652932056',
                application: {
                    application_id:
                        'AC9WC3DF6FCE052E45A4566A48E6B7193774B84814CE49A922E163B8B29881DC',
                },
            },
            version: '1.0',
        });

        this.state = <{}>response.session_state;
        this.isNew = false;

        return response.response;
    }
}
