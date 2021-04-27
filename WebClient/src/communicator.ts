import * as signalR from "@microsoft/signalr";

export class Communicator {

    //singlr connection cannot be started in a constructor; use a wrapper to setup connection
    //TODO: change to private later after adding callbacks
    private connectionWrapper = new class {

        connection: any;

        establishConnection() {
            this.connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:5001/testhub").build();
            this.connection.start();
        }

    }

    //TODO: need a better way to map hub function names
    receiveMethodName: string;
    subResponseMethodName: string;

    constructor() {
        this.connectionWrapper.establishConnection();
        this.receiveMethodName = "ReceiveMessage";
        this.subResponseMethodName = "ReceiveGroup";
    }

    //TODO: put the register methods in constructor
    registerReceiveCallback(callback: Function) {
        this.connectionWrapper.connection.on(this.receiveMethodName, callback);
    }

    registerResponseCallback(callback: Function) {
        this.connectionWrapper.connection.on(this.subResponseMethodName, callback);
    }

    //sendMessage(user: string, message: string) {
    //    console.log("Client called send message to all method");
    //    this.connectionWrapper.connection.invoke("SendMessageAsync", user, message);
    //}

    publish(user: string, topic: string, message: string) {
        console.log("Client called publish method");
        this.connectionWrapper.connection.invoke("PublishMessageAsync", user, topic, message);
    }
    
    async subscribeAsync(topic: string) {
        console.log("Client called subscribe method");
        await this.connectionWrapper.connection.invoke("SubscribeTopicAsync", topic);
    }

    async unsubscribeAsync(topic: string) {
        console.log("Client called unsubscribe method");
        await this.connectionWrapper.connection.invoke("UnsubscribeTopicAsync", topic);
    }

}