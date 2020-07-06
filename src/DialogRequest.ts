import { DialogIntents } from './DialogIntents';

export interface DialogRequest {
    meta: {
        locale: string; // 'ru-RU';
        timezone: string; // 'Europe/Moscow';
    };
    request: {
        command: string; // 'где ближайшее отделение';
        original_utterance: string; // 'Алиса спроси у Сбербанка где ближайшее отделение';
        markup: {
            dangerous_context: boolean;
        };
        nlu: {
            tokens: string[]; // Массив слов из произнесенной пользователем фразы.
            intents: DialogIntents; // Интенты
        };
    };
    state: {
        session: {} | { state: unknown; $currentScene: string };
    };
    session: {
        application: {
            // Идентификатор экземпляра приложения, в котором пользователь общается с Алисой
            application_id: string;
        };
        new: boolean; // пользователь начал новый разговор с навыком;
        message_id: number;
        session_id: string; // '2eac4854-fce721f3-b845abba-20d60';
        skill_id: string; // '3ad36498-f5rd-4079-a14b-788652932056';
    };
    version: string; // '1.0';
}


