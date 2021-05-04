import * as signalR from "@microsoft/signalr";
import { Guid } from "guid-typescript";
import { Message } from "./message";
import { IMessage } from "./IMessage";
import { ICommunicator } from "./ICommunicator";
import { Response } from "./Response";
import { IResponse } from "./IResponse";


export class Communicator implements ICommunicator {

    private connection: any;
    private callbacksByTopics: Map<string, (message: IMessage) => any>;

    //construct and return a timeout promise
    private timeoutAsync(ms: number = 2000, correlationId : string = "", content : string = "", sender : string = "", topic : string = "") : Promise<IResponse> {
        let timeoutResponse = new Response(correlationId, content, sender, topic, false);
        return new Promise((resolve, reject) => setTimeout(() => reject(timeoutResponse), ms));
    }

    //register the handler to the hub method
    private registerCallback(hubMethod: string, handler: Function) {
        this.connection.on(hubMethod, handler);
    }

    //deregister all callbacks from the hub method
    private deregisterAllCallbacks(hubMethod: string) {
        this.connection.off(hubMethod);
    }

    //Question: Sall we make start connection public
    establishConnection(url: string) {
        this.connection = new signalR.HubConnectionBuilder().withUrl(url).build();
        let startTask = this.connection.start();
        console.log(startTask);
        startTask.then(() => {
                console.log("connected to hub");//How to send response back to the client?
            })
            .catch(() => {
                console.log("failed to connect");
            });
    }

    constructor() {
        this.establishConnection("https://localhost:5001/signalRhub?name=testName");
        //this.connectionWrapper.establishConnection("https://localhost:5001/signalRhub");
        this.callbacksByTopics = new Map();

        this.registerCallback("onPublish", (messageReceived: IMessage) => {
            let topicCallback = this.callbacksByTopics.get(messageReceived.Topic);
            topicCallback(messageReceived);//invoke callback
        });

        this.registerCallback("onConnect", (response: IResponse) => {
            console.log(response);//test
        });

    }

    publish(topic: string, message: string) {
        console.log("Client called publish method");//test
        let correlationID = Guid.create().toString();
        let messageToSend = new Message(correlationID, message, "user1", topic);
        console.log(messageToSend)
        this.connection.invoke("PublishAsync", messageToSend);
    }


    async subscribeAsync(topic: string, topicCallback: (message: IMessage) => any): Promise<IResponse>{
        console.log("Client called subscribe method");//test

        if (this.callbacksByTopics.has(topic)) {//cannot subscribe twice

            let duplicateSubResponse = new Response("", "", "user1", topic, false);
            return new Promise<IResponse>((resolve, reject) => {
                reject(duplicateSubResponse);
            });

        } else {

            let correlationID = Guid.create().toString();
            let messageToSend = new Message(correlationID, "", "user1", topic);
            let serviceTask = this.connection.invoke("SubscribeTopicAsync", messageToSend);
            //set timeout
            let timeoutTask = this.timeoutAsync();
            //wait for one of the tasks to settle
            let taskResult = await Promise.race([serviceTask, timeoutTask]);
            if (taskResult.Success === true) {
                //add callback function to the dictionary
                console.log("sub success");//test
                this.callbacksByTopics.set(topic, topicCallback);
                console.log(this.callbacksByTopics);//test
            }
            //test
            console.log("print the promise and response:");
            console.log(serviceTask);
            console.log(timeoutTask);
            console.log(taskResult);

            return taskResult;
        }

    }

    async unsubscribeAsync(topic: string): Promise<IResponse>{
        console.log("Client called unsubscribe method");

        if (!this.callbacksByTopics.has(topic)) {

            let duplicateUnsubResponse = new Response("", "you need to subscribe before unsubscribing", "user1", topic, false);
            return new Promise<IResponse>((resolve, reject) => {
                reject(duplicateUnsubResponse);
            });

        } else {
            let correlationID = Guid.create().toString();
            let messageToSend = new Message(correlationID, "", "user1", topic);
            let serviceTask = this.connection.invoke("UnsubscribeTopicAsync", messageToSend);
            //set timeout
            let timeoutTask = this.timeoutAsync();
            //wait for one of the tasks to settle
            let taskResult = await Promise.race([serviceTask, timeoutTask]);
            
            if (taskResult.Success===true) {
                console.log("unsub success");//test
                //remove from dictionary
                this.callbacksByTopics.delete(topic);
                console.log(this.callbacksByTopics);//test
            }

            //test
            console.log("print the promise and response:");
            console.log(serviceTask);
            console.log(timeoutTask);
            console.log(taskResult);

            return taskResult;
        }
    }

    async disconnectAsync(): Promise<IResponse> {
        let serviceTask = this.connection.stop();
        let timeoutTask = this.timeoutAsync();
        let taskResult = await Promise.race([serviceTask, timeoutTask]);
        return taskResult;
    }
}