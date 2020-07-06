import { DialogRequest } from './DialogRequest';
import { DialogResponse } from './DialogResponse';

export type RequestHandler = (request: DialogRequest) => Promise<DialogResponse>;
