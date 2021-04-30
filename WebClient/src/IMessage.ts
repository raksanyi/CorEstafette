export interface IMessage {
    topic : string;
    content : string;
    sender : string ;
    correlationId : string;
    timeStamp : Date;
}

  