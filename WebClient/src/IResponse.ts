import { IMessage } from "./IMessage";

export interface IResponse extends IMessage {
    success: boolean;
}