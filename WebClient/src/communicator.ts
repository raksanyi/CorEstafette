import * as signalR from "@microsoft/signalr";
import { Guid } from "guid-typescript";
import { Message } from "./message";
import { IMessage } from "./IMessage";
import { ICommunicator } from "./ICommunicator";
import { Response } from "./Response";
import { IResponse } from "./IResponse";
import { IRequest } from "./IRequest";
import { Request } from "./Request";



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

    private callbacksByTopics: Map<string, (message: IMessage) => any>;
    private userId: string;
    private callbacksByResponder: Map<string, (request: IRequest) => any>;

    constructor() {
        this.connectionWrapper.establishConnection("https://localhost:5001/signalRhub");
        this.callbacksByTopics = new Map();
        this.callbacksByResponder = new Map();
        this.userId = "User" + Math.floor(Math.random() * (100 - 1 + 1)) + 1;
        console.log(this.userId);

        this.connectionWrapper.registerCallback("onPublish", (messageReceived: IMessage) => {
            console.log("inside receiveHandler");//test
            //console.log(this.callbacksByTopics);//test
            //console.log(objectReceived.Topic);
            ////const messageReceived: IMessage = <IMessage>objectReceived;
            //let messageReceived = new Message(objectReceived.CorrelationId, objectReceived.Content, objectReceived.Sender, objectReceived.Topic, objectReceived.TimeStamp);
            console.log(messageReceived);

            let topicCallback = this.callbacksByTopics.get(messageReceived.Topic);
            topicCallback(messageReceived);//invoke callback

            //TODO: does callback have more parameters?
        })

        this.connectionWrapper.registerCallback("OnQuery", (requestReceived: IRequest) => {
            console.log(requestReceived);

            let respondCallback = this.callbacksByResponder.get(requestReceived.Destination);
            respondCallback(requestReceived); 

            //async using await and use 2000 sec task

            let result = respondCallback(requestReceived);

            //console.log(result);

            //queryResponseAsync to the hub
            //create a new response
            let responseToSend = new Response(requestReceived.CorrelationId, result, requestReceived.Sender, "", true);
            this.connectionWrapper.connection.invoke("RespondQueryAysnc", responseToSend);
        })

        //this.connectionWrapper.registerCallback("OnResponse", (responseReceived: IResponse) => {
        //    console.log(responseReceived);

        //    let respondCallback = this.callbacksByResponder.get(responseReceived.Sender);
        //    //respondCallback(requestReceived); 

        //    respondCallback(responseReceived);

           
        //})

        //this.connectionWrapper.registerCallback("OnResponse", (responseReceived: IResponse) => {
        //    console.log(responseReceived);

        //})
    }



    //publish message under certain topic
    publish(topic: string, message: string) {
        console.log("Client called publish method");//test
        let correlationID = Guid.create().toString();
        let messageToSend = new Message(correlationID, message, this.userId, topic);
        console.log(messageToSend)
        this.connectionWrapper.connection.invoke("PublishAsync", messageToSend);
    }


    async subscribeAsync(topic: string, topicCallback: (message: IMessage) => any): Promise<IResponse>{
        console.log("Client called subscribe method");//test

        if (this.callbacksByTopics.has(topic)) {//cannot subscribe twice
            let duplicateSubResponse = new Response("", "", this.userId, topic, false);
            return new Promise<IResponse>((resolve, reject) => {
                reject(duplicateSubResponse);
            });

        } else {

            let correlationID = Guid.create().toString();
            let messageToSend = new Message(correlationID, "", this.userId, topic);
            console.log(messageToSend);
            let serviceTask = this.connectionWrapper.connection.invoke("SubscribeTopicAsync", messageToSend);
            //set timeout
            let timeoutResponse = new Response(correlationID, "", "user1", topic, false);
            let timeoutTask = new Promise((resolve, reject) => setTimeout(() => reject(timeoutResponse), 2000)); //timeout after two seconds
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
            let messageToSend = new Message(correlationID, "", this.userId, topic);
            let serviceTask = this.connectionWrapper.connection.invoke("UnsubscribeTopicAsync", messageToSend);
            //set timeout
            let timeoutResponse = new Response(correlationID, "", "user1", topic, false);
            let timeoutTask = new Promise((resolve, reject) => setTimeout(() => reject(timeoutResponse), 2000)); //timeout after two seconds
            //wait for one of the tasks to settle
            let taskResult = await Promise.race([serviceTask, timeoutTask]);
            
            if (taskResult.Success===true) {
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
        }
    }

   

   queryAsync(responder: string, additionalData: string, respondCallback: (request: IRequest) => any) {: Promise<IResponse> {
    
        this.callbacksByResponder.set(responder, respondCallback);
        console.log(this.callbacksByResponder);
    
        let correlationID = Guid.create().toString();
        let requestToSend = new Request(correlationID, additionalData, this.userId, null, responder);
        console.log(requestToSend);
        this.connectionWrapper.connection.invoke("QueryAsync", requestToSend).catch(err => console.log(err));

        let timeoutResponse = new Response(correlationID, "", this.userId, "", false);
        let timeoutTask = new Promise((resolve, reject) => setTimeout(() => reject(timeoutResponse), 2000));
        let taskResult = await Promise.race([serviceTask, timeoutTask]);
        return taskResult;
    }

    //async queryAsync(responder: string, additionalData: string): Promise<IResponse> {
    //    // id: string, content: string, sender: string, topic: string, destination: boolean
    //    let correlationID = Guid.create().toString();
    //    let requestToSend = new Request(correlationID, additionalData, this.userId, "", responder);
    //    console.log("requestToSend" + requestToSend);
    //    let serviceTask = this.connectionWrapper.connection.invoke("QueryAsync", requestToSend);

    //    let timeoutResponse = new Response(correlationID, "", this.userId, "", false);
    //    let timeoutTask = new Promise((resolve, reject) => setTimeout(() => reject(timeoutResponse), 2000));
    //    let taskResult = await Promise.race([serviceTask, timeoutTask]);
    //    return taskResult;
    //}

    // //bool AddResponse(string responder, Func<IRequest, object> callback);
    //addResponder(responder : string, respondCallback: (request: IRequest) => any) {
    //    //if (!this.callbacksByResponder.has(responder)) {

    //        this.callbacksByResponder.set(responder, respondCallback);
    //        console.log(this.callbacksByResponder);
    //    //}
    //}

    respondQueryAsync(requestReceived: IRequest, respondMessage: string) {
        let responseToSend = new Response(requestReceived.CorrelationId, respondMessage, requestReceived.Sender, "", true);
        this.connectionWrapper.connection.invoke("RespondQueryAysnc", responseToSend);
    }
   
}