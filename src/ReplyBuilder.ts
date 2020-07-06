import { DialogResponse } from './DialogResponse';
import { ReplyText } from './ReplyText';
import { SessionState } from './SessionState';

export class ReplyBuilder {
    private text: string = '';
    private tts: string = '';
    private imageId?: string;
    private endSession: boolean = false;
    private readonly buttons: { title: string; url?: string }[] = [];

    get buttonsCount() {
        return this.buttons.length;
    }

    withText(...speechParts: ReplyText[]) {
        for (const part of speechParts) {
            this.addSpace(part);

            if (Array.isArray(part)) {
                this.text += part[0];
                this.tts += part[1];
            } else {
                this.text += part;
                this.tts += part;
            }
        }
    }

    withTts(...ttsParts: (string | number)[]) {
        for (const part of ttsParts) {
            this.addSpaceToTts();
            this.tts += part;
        }
    }

    withTextPluralized(count: number, one: ReplyText, some: ReplyText, many: ReplyText) {
        const caseIndex =
            count % 10 == 1 && count % 100 != 11
                ? 0
                : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)
                ? 1
                : 2;

        this.withText([one, some, many][caseIndex]);
    }

    withEndSession() {
        this.endSession = true;
    }

    withButton(params: string | { title: string; url: string }) {
        if (typeof params === 'string') {
            this.buttons.push({ title: params });
        } else {
            this.buttons.push(params);
        }
    }

    withImage(imageId: string) {
        if (this.imageId) {
            throw new Error('Изображение уже задано.');
        }

        this.imageId = imageId;
    }

    selectRandom<TItem>(fn: (item: TItem) => void, items: TItem[], number: number = 1): void {
        if (number === 0 || items.length === 0) {
            return;
        }

        const randomItem = items[Math.floor(Math.random() * items.length)];
        fn(randomItem);

        this.selectRandom(
            fn,
            items.filter((item) => item !== randomItem),
            number - 1
        );
    }

    build<TState, TSceneId>(sessionState: SessionState<TState, TSceneId>): DialogResponse {
        const card = this.imageId
            ? {
                  type: 'BigImage',
                  image_id: this.imageId,
                  description: this.text.substr(0, 255),
              }
            : undefined;

        return {
            response: {
                text: this.text,
                tts: this.tts,
                card,
                end_session: this.endSession,
                buttons: this.buttons.map((item) => {
                    return {
                        title: item.title,
                        url: item.url,
                        hide: true,
                    };
                }),
            },
            session_state: sessionState,
            version: '1.0',
        };
    }

    /**
     * Добавляет пробелы в конце text и tts
     * (нужно перед добавлением новой части)
     */
    private addSpace(part: ReplyText) {
        const textPart = Array.isArray(part) ? part[0] : part;
        const textPartString = textPart.toString();

        if (
            this.text &&
            !this.text.endsWith(' ') &&
            !textPartString.startsWith(',') &&
            !textPartString.startsWith('.')
        ) {
            this.text += ' ';
        }

        this.addSpaceToTts();
    }

    private addSpaceToTts() {
        if (this.tts && !this.tts.endsWith(' ')) {
            this.tts += ' ';
        }
    }
}
