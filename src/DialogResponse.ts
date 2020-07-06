export interface DialogResponse {
    response: {
        text: string; // 'Здравствуйте! Это мы, хороводоведы.';
        tts?: string; // 'Здравствуйте! Это мы, хоров+одо в+еды.';
        buttons?: {
            title: string;
            url?: string;
            hide?: boolean; // Признак того, что кнопку нужно убрать после следующей реплики пользователя.
        }[];
        card?: {
            type: string;
            image_id: string;
            title?: string;
            description?: string;
        };
        end_session: boolean;
    };
    version: string; // '1.0';
    session_state?: unknown;
}
