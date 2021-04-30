import { IMessage } from "./IMessage";

export class Message implements IMessage {
    private _correlationId: string;
    private _content: string;
    private _sender: string;
    private _topic: string;
    private _timeStamp: Date;

    constructor(id: string, content: string, sender: string, topic: string) {
        this._correlationId = id;
        this._content = content;
        this._sender = sender;
        this._topic = topic;
        this._timeStamp = new Date();
    }

    get topic() { return this._topic; }
    set topic(value: string) { this._topic = value; }

    get correlationId() { return this._correlationId; }
    set correlationId(value: string) { this._correlationId = value; }

    get sender() { return this._sender; }
    set sender(value: string) { this._sender = value; }

    get content() { return this._content; }
    set content(value: string) { this._content = value; }

    get timeStamp() { return this._timeStamp; }
    set timeStamp(value: Date) { this._timeStamp = value; }


}