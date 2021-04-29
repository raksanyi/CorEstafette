import { IMessage } from "./IMessage";

export class Message implements IMessage {
    correlationId: string;
    content: string;
    sender: string;
    topic: string;

    constructor(id: string, content: string, sender: string, topic: string) {
        this.correlationId = id;
        this.content = content;
        this.sender = sender;
        this.topic = topic;
    }

}