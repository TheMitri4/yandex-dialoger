import { DialogRequest } from './DialogRequest';
import { DialogResponse } from './DialogResponse';

export interface RequestHandler {
    handleRequest(request: DialogRequest): Promise<DialogResponse>;
}
