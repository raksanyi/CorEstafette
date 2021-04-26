export default function Message(id, content, messageType, sender) {
    this.CorrelationId = id;
    this.Content = content;
    this.MessageType = messageType;
    this.Sender = sender;
}


const MessageType = {
    PUBLISH: 0,
    PUBLISH_RESPONSE: 1,
    CONNECT: 2,
    CONNECT_RESPONSE: 3,
    SUBSCRIBE: 4,
    SUBSCRIBE_RESPONSE: 5,
    UNSUBSCRIBE: 6,
    UNSUBSCRIBE_RESPONSE: 7
}

