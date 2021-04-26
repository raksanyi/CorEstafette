import * as signalR from "@microsoft/signalr";

export class Communicator {
    connection: any;

    constructor() {
        this.connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:5001/testhub").build();
    }

    startConnection() {
        this.connection.start();
    }

    //TODO:
    //1. when subscribe and subscribe, communicator need to wait for answer
    //2. convert message to json
    //3. subscribe to topic with callback, cache topic-callback pairs

    sendMessage(user: string, message: string) {
        console.log("Client called send message to all method");
        this.connection.invoke("SendMessage", user, message);
    }

    publish(user: string, topic: string, message: string) {
        console.log("Client called publish method");
        this.connection.invoke("PublishMessage", user, topic, message);

    }

    async subscribe(user: string, topic: string) {
        console.log("Client called subscribe method");
        this.connection.invoke("SubscribeTopic", user, topic);

    }

    async unsubscribe(user: string, topic: string) {
        console.log("Client called unsubscribe method");
        this.connection.invoke("UnsubscribeTopic", user, topic);

    }

}