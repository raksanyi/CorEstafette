var Message = /** @class */ (function () {
    function Message(id, content, sender, topic) {
        this.CorrelationId = id;
        this.Content = content;
        this.Sender = sender;
        this.Topic = topic;
    }
    return Message;
}());
export { Message };
//# sourceMappingURL=message.js.map