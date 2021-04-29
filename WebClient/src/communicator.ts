import * as signalR from "@microsoft/signalr";
import { Guid } from "guid-typescript";
import { Message } from "./message";
import { IMessage } from "./IMessage";
import { ICommunicator } from "./ICommunicator";
import { Response } from "./Response";
import { IResponse } from "./IResponse";


export class Communicator implements ICommunicator {

    //singlr connection cannot be started in a constructor; use a wrapper to setup connection
    private connectionWrapper = new class {

        connection: any;

        establishConnection(url: string) {
            this.connection = new signalR.HubConnectionBuilder().withUrl(url).build();
            this.connection.start();
        }

        //register the handler to the hub method
        registerCallback(hubMethod: string, handler: Function) {
            this.connection.on(hubMethod, handler);
        }

        //deregister all callbacks from the hub method
        deregisterAllCallbacks(hubMethod: string) {
            this.connection.off(hubMethod);
        }

    }

    private callbacksByTopics: Map<string, (topic: string, message: string)=> any>;
    private responseByCorrelationIds: Map<string, (statusCode: number) => any>;

    /*
    //status code
    SUCCEEDED = 0;
    REJECTED = 1;
    DUPLICATE_SUB = 2;
    DUPLICATE_UNSUB = 3;
    */

    constructor() {
        this.connectionWrapper.establishConnection("https://localhost:5001/testhub");
        this.callbacksByTopics = new Map();
        this.responseByCorrelationIds = new Map();

        this.connectionWrapper.registerCallback("onPublish", (objectReceived: IMessage) => {
            console.log("inside receiveHandler");//test
            console.log(this.callbacksByTopics);//test
            const messageReceived: IMessage = <IMessage>objectReceived;

            let topicCallback = this.callbacksByTopics.get(messageReceived.topic);
            topicCallback(messageReceived.topic, messageReceived.content);//invoke callback
            //TODO: does callback have more parameters?
        });
    }

    //publish message under certain topic
    publish(topic: string, message: string) {
        console.log("Client called publish method");
        let correlationID = Guid.create().toString();
        console.log("correlationID" + correlationID);
        let messageToSend = new Message(correlationID, message, "user1", topic);
        console.log(messageToSend)
        this.connectionWrapper.connection.invoke("PublishAsync", messageToSend);
    }


    async subscribeAsync(topic: string, topicCallback: (topic: string, message: string) => any): Promise<IResponse>{
        console.log("Client called subscribe method");

        if (this.callbacksByTopics.has(topic)) {//cannot subscribe twice

            let duplicateSubResponse = new Response("", "", "user1", topic, false);
            return new Promise<IResponse>((resolve, reject) => {
                reject(duplicateSubResponse);
            });

        } else {

            let correlationID = Guid.create().toString();
            let messageToSend = new Message(correlationID, "", "user1", topic);
            let serviceTask = this.connectionWrapper.connection.invoke("SubscribeTopicAsync", messageToSend);
            //set timeout
            let timeoutResponse = new Response(correlationID, "", "user1", topic, false);
            let timeoutTask = new Promise((resolve, reject) => setTimeout(() => reject(timeoutResponse), 2000)); //timeout after two seconds
            //wait for one of the tasks to settle
            let taskResult = await Promise.race([serviceTask, timeoutTask]);
            if (taskResult.success === true) {
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
            /*
            result.then(() => {
                console.log("sub success");//test
                //add callback function to the dictionary
                this.callbacksByTopics.set(topic, topicCallback);

                return new Promise<IResponse>((resolve, reject) => {
                    resolve(this.SUCCEEDED);//TODO: change this to IResponse
                });
                //subResponseCallback(this.SUCCEEDED);
            }).catch((err: any) => {
                console.log("sub rejected");//test
                return new Promise<IResponse>((resolve, reject) => {//TODO: change this to IResponse Promise
                    reject("Service rejected the subscription");
                });
                //subResponseCallback(this.REJECTED);
            });
            */
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
            let serviceTask = this.connectionWrapper.connection.invoke("UnsubscribeTopicAsync", messageToSend);
            //set timeout
            let timeoutResponse = new Response(correlationID, "", "user1", topic, false);
            let timeoutTask = new Promise((resolve, reject) => setTimeout(() => reject(timeoutResponse), 2000)); //timeout after two seconds
            //wait for one of the tasks to settle
            let taskResult = await Promise.race([serviceTask, timeoutTask]);
            
            if (taskResult.success===true) {
                console.log("unsub success");//test
                //remove from dictionary
                this.callbacksByTopics.delete(topic);
                console.log(this.callbacksByTopics);//test
            }

            //test
            console.log(serviceTask);
            console.log(timeoutTask);
            console.log(taskResult);

            return taskResult;

            /*
            let correlationID = Guid.create().toString();
            let messageToSend = new Message(correlationID, "", "user1", topic);
            let result = this.connectionWrapper.connection.invoke("UnsubscribeTopicAsync", messageToSend);
            console.log(result);//test

            result.then(() => {
                console.log("unsub success");//test
                //remove from dictionary
                this.callbacksByTopics.delete(topic);

                return new Promise<IResponse>((resolve, reject) => {
                    resolve(this.SUCCEEDED);
                });
                //unsubResponseCallback(this.SUCCEEDED);
            }).catch((err: any) => {
                console.log("unsub rejected");//test
                return new Promise<IResponse>((resolve, reject) => {
                    reject("Service rejected unsubscription");
                });
                //unsubResponseCallback(this.REJECTED);
            });*/
        }
    }

}