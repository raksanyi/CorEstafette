import * as signalR from "@microsoft/signalr";
import { Guid } from "guid-typescript";
import { Message } from "./message";
import { IMessage } from "./IMessage";

export class Communicator {

    //singlr connection cannot be started in a constructor; use a wrapper to setup connection
    private connectionWrapper = new class {

        connection: any;

        establishConnection() {
            this.connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:5001/testhub").build();
            this.connection.start();
        }

        //map the handler to the hub method
        registerCallback(hubMethod: string, handler: Function) {
            this.connection.on(hubMethod, handler);
        }

        //deregister all callbacks from the hub method
        deregisterAllCallbacks(hubMethod: string) {
            this.connection.off(hubMethod);
        }

    }

    callbacksByTopics: Map<string, Function>;

    constructor() {
        this.connectionWrapper.establishConnection();
        this.callbacksByTopics = new Map();
        //this.connectionWrapper.registerCallback("ReceiveMessage", (user: string, message: string) => {
        //    console.log("inside receiveHandler");
        //    //TODO: deal with message with multiple topics; service need to send topic to the communicator
        //    let testTopic = "A";//TODO: delete later; need to get this from the service
        //    console.log(this.callbacksByTopics);
        //    let topicCallback = this.callbacksByTopics.get(testTopic);
        //    console.log("get callback:");
        //    console.log(topicCallback);
        //    topicCallback(user, message);
        //    //TODO: add parameters list?

        //});

        //New code for receiving message
        this.connectionWrapper.registerCallback("ReceiveMessage", (objectReceived: IMessage) => {   
            console.log("inside receiveHandler");
            console.log("objectReceived" + objectReceived);
            const messageReceived: IMessage = <IMessage>objectReceived;
     
            let topicReceived = messageReceived.topic;
            console.log("topicReceived:" + topicReceived);

            let topicCallback = this.callbacksByTopics.get(topicReceived);
            console.log("get callback:" + topicCallback);

            topicCallback(messageReceived.sender, messageReceived.content);
        });
    }


    //NEW: publish message by sending a message object 
    publish(user: string, topic: string, message: string) {
        console.log("Client called publish method");
        let correlationID = Guid.create().toString();
        console.log("correlationID" + correlationID);
        let messageToSend = new Message(correlationID, message, user, topic);
        console.log(messageToSend)
        this.connectionWrapper.connection.invoke("PublishMessageAsync", messageToSend);
    }

    ////OLD: publish message under certain topic
    //publish(user: string, topic: string, message: string) {

    //    console.log("Client called publish method");
    //    this.connectionWrapper.connection.invoke("PublishMessageAsync", user, topic, message);
    //}

    //subscribe to a topic, store the callback function for that topic, and invoke responseCallback for state of subscription
    //async subscribeAsync(topic: string, topicCallback: Function, responseCallback: Function) {

       
    //    console.log("Client called subscribe method");
    //    let result = this.connectionWrapper.connection.invoke("SubscribeTopicAsync", topic);
    //    console.log(result);//test
    //    let statusCode;
    //    result.then(() => {
    //        console.log("success");//test
    //        statusCode = 0;
    //        responseCallback(statusCode);
    //        //TODO: can client change the callback for the same topic? if so, then:
    //        //TODO: deregister the cached callback if topic has been subscribed, and cache new callback
    //        //add callback function to the dictionary
    //        this.callbacksByTopics.set(topic, topicCallback);
    //        console.log(this.callbacksByTopics);//test
    //    }).catch((err: any) => {
    //        console.log("rejected");//test
    //        statusCode = 1;
    //        responseCallback(statusCode);
    //    });
    //}

    //async unsubscribeAsync(topic: string) {
    //    console.log("Client called unsubscribe method");
    //    await this.connectionWrapper.connection.invoke("UnsubscribeTopicAsync", topic);
    //    //TODO: add promise logic here
    //    if (this.callbacksByTopics.has(topic)) {
    //        this.callbacksByTopics.delete(topic);
    //        console.log(this.callbacksByTopics);//test
    //    }

    //}

    async subscribeAsync(topic: string, topicCallback: Function, responseCallback: Function) {


        console.log("Client called subscribe method");

        let correlationID = Guid.create().toString();
        let messageToSend = new Message(correlationID, "", "user1", topic);
        let result = this.connectionWrapper.connection.invoke("SubscribeTopicAsync", messageToSend);
        console.log(result);//test

        let statusCode;
        result.then(() => {
            console.log("success");//test
            statusCode = 0;
            responseCallback(statusCode);
            //TODO: can client change the callback for the same topic? if so, then:
            //TODO: deregister the cached callback if topic has been subscribed, and cache new callback
            //add callback function to the dictionary
            this.callbacksByTopics.set(topic, topicCallback);
            console.log(this.callbacksByTopics);//test
        }).catch((err: any) => {
            console.log("rejected");//test
            statusCode = 1;
            responseCallback(statusCode);
        });
    }

    async unsubscribeAsync(topic: string) {
        console.log("Client called unsubscribe method");

        let correlationID = Guid.create().toString();
        let messageToSend = new Message(correlationID, "", "user1", topic);
        await this.connectionWrapper.connection.invoke("SubscribeTopicAsync", messageToSend);

        //TODO: add promise logic here
        if (this.callbacksByTopics.has(topic)) {
            this.callbacksByTopics.delete(topic);
            console.log(this.callbacksByTopics);//test
        }

    }

}