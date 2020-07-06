
export interface DialogIntents {
    [intentName: string]: {
        slots: {
            [intentName: string]: {
                type: string;
                tokens: {
                    start: number;
                    end: number;
                };
                value: string;
            };
        };
    };
}
