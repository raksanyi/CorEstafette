import * as signalR from "@microsoft/signalr";
import { ICommunicator } from "./ICommunicator";

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

    //status code
    SUCCEEDED = 0;
    REJECTED = 1;
    DUPLICATE_SUB = 2;
    DUPLICATE_UNSUB = 3;

    constructor() {
        this.connectionWrapper.establishConnection("https://localhost:5001/testhub");
        this.callbacksByTopics = new Map();
        this.responseByCorrelationIds = new Map();
        this.connectionWrapper.registerCallback("onPublish", (topic: string, message: string) => {
            console.log("inside receiveHandler");//test
            console.log(this.callbacksByTopics);//test
            let topicCallback = this.callbacksByTopics.get(topic);
            topicCallback(topic, message);//invoke callback
            //TODO: does callback have more parameters
        });
    }

    //publish message under certain topic
    publish(topic: string, message: string) {
        console.log("Client called publish method");
        this.connectionWrapper.connection.invoke("PublishAsync", topic, message);
    }

    //subscribe to a topic, store the callback function for that topic, and invoke responseCallback for state of subscription
    async subscribeAsync(topic: string, topicCallback: (topic: string, message: string) => any) : Promise<number>{
        console.log("Client called subscribe method");

        if (this.callbacksByTopics.has(topic)) {
            return new Promise<number>((resolve, reject) => {
                reject("You have subscribed to this topic");
            });
        } else {
            let result = this.connectionWrapper.connection.invoke("SubscribeTopicAsync", topic);
            console.log(result);//test

            result.then(() => {
                console.log("sub success");//test
                //add callback function to the dictionary
                this.callbacksByTopics.set(topic, topicCallback);

                return new Promise<number>((resolve, reject) => {
                    resolve(this.SUCCEEDED);//TODO: change this to IResponse
                });
                //subResponseCallback(this.SUCCEEDED);
            }).catch((err: any) => {
                console.log("sub rejected");//test
                return new Promise<number>((resolve, reject) => {//TODO: change this to IResponse Promise
                    reject("Service rejected the subscription");
                });
                //subResponseCallback(this.REJECTED);
            });
        }

    }

    async unsubscribeAsync(topic: string) : Promise<number>{
        console.log("Client called unsubscribe method");

        if (!this.callbacksByTopics.has(topic)) {
            return new Promise<number>((resolve, reject) => {
                reject("You need to subscribe first before unsubscribing");
            });
            //unsubResponseCallback(this.DUPLICATE_UNSUB);
        } else {
            let result = this.connectionWrapper.connection.invoke("UnsubscribeTopicAsync", topic);
            console.log(result);//test

            result.then(() => {
                console.log("unsub success");//test
                //remove from dictionary
                this.callbacksByTopics.delete(topic);

                return new Promise<number>((resolve, reject) => {
                    resolve(this.SUCCEEDED);
                });
                //unsubResponseCallback(this.SUCCEEDED);
            }).catch((err: any) => {
                console.log("unsub rejected");//test
                return new Promise<number>((resolve, reject) => {
                    reject("Service rejected unsubscription");
                });
                //unsubResponseCallback(this.REJECTED);
            });
        }
    }

}