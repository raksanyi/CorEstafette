import * as signalR from "@microsoft/signalr";

export class Communicator {
    connection: any;

    constructor() {
        this.connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:5001/testhub").build();
    }

    startConnection() {
        this.connection.start();
    }

    sendMessage(user: string, message: string) {
        console.log("Client called send message to all method");
        this.connection.invoke("SendMessageAsync", user, message);
    }

    publish(user: string, topic: string, message: string) {
        console.log("Client called publish method");
        this.connection.invoke("PublishMessageAsync", user, topic, message);

    }

    async subscribeAsync(topic: string) {
        console.log("Client called subscribe method");
        await this.connection.invoke("SubscribeTopicAsync", topic);
    }

    async unsubscribeAsync(topic: string) {
        console.log("Client called unsubscribe method");
        await this.connection.invoke("UnsubscribeTopicAsync", topic);
    }

}