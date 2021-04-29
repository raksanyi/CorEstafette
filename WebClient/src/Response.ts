import { IResponse } from "./IResponse";

export class Response implements IResponse {
    correlationId: string;
    content: string;
    sender: string;
    topic: string;
    success: boolean;

    constructor(id: string, content: string, sender: string, topic: string, success: boolean) {
        this.correlationId = id;
        this.content = content;
        this.sender = sender;
        this.topic = topic;
        this.success = success;
    }

}