import { ReplyBuilder } from './ReplyBuilder';

export type ReplyHandler<TState> = (replyBuilder: ReplyBuilder, state: TState) => void;
