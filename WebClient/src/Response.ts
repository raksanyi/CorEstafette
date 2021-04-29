import { IMessage } from "./IMessage";

export class Response implements IMessage {
    correlationId: string;
    content: string;
    sender: string;
    topic: string;
    success: boolean;

    constructor(_id: string, _content: string, sender: string, topic: string, success: boolean) {
        this.correlationId = id;
        this.content = content;
        this.sender = sender;
        this.topic = topic;
        this.success = success;
    }

}