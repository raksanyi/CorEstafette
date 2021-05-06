import { IMessage } from "./IMessage";

export interface IRequest extends IMessage {

    Destination: string;
}

