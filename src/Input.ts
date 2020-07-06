import { DialogRequest } from './DialogRequest';
import { DialogIntents } from './DialogIntents';

export interface Input {
    command: string;
    intents: DialogIntents;
    request: DialogRequest;
    isConfirm: boolean;
    isReject: boolean;
};
