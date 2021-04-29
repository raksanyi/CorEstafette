import * as signalR from "@microsoft/signalr";


export class Communicator {

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

    private callbacksByTopics: Map<string, (arg1: string, arg2: string)=> any>;

    //status code
    SUCCEEDED = 0;
    REJECTED = 1;
    DUPLICATE_SUB = 2;
    DUPLICATE_UNSUB = 3;

    constructor() {
        this.connectionWrapper.establishConnection("https://localhost:5001/testhub");
        this.callbacksByTopics = new Map();
        this.connectionWrapper.registerCallback("onPublish", (topic: string, message: string) => {
            console.log("inside receiveHandler");
            console.log(this.callbacksByTopics);
            if (this.callbacksByTopics.has(topic)) {
                let topicCallback = this.callbacksByTopics.get(topic);
                topicCallback(topic, message);//TODO: does callback have more parameters
            }
        });
    }

    //publish message under certain topic
    publish(topic: string, message: string) {
        console.log("Client called publish method");
        this.connectionWrapper.connection.invoke("PublishAsync", topic, message);
    }

    //subscribe to a topic, store the callback function for that topic, and invoke responseCallback for state of subscription
    async subscribeAsync(topic: string, topicCallback: (arg1: string, arg2: string) => any, subResponseCallback: (arg1: number) => any) {
        console.log("Client called subscribe method");

        if (this.callbacksByTopics.has(topic)) {
            subResponseCallback(this.DUPLICATE_SUB);
        } else {
            let result = this.connectionWrapper.connection.invoke("SubscribeTopicAsync", topic);
            console.log(result);//test

            result.then(() => {
                console.log("sub success");//test
                //add callback function to the dictionary
                this.callbacksByTopics.set(topic, topicCallback);
                console.log(this.callbacksByTopics);//test
                subResponseCallback(this.SUCCEEDED);
            }).catch((err: any) => {
                console.log("sub rejected");//test
                subResponseCallback(this.REJECTED);
            });
        }

    }

    async unsubscribeAsync(topic: string, unsubResponseCallback: (arg1: number) => any) {
        console.log("Client called unsubscribe method");

        if (!this.callbacksByTopics.has(topic)) {
            unsubResponseCallback(this.DUPLICATE_UNSUB);
        } else {
            let result = this.connectionWrapper.connection.invoke("UnsubscribeTopicAsync", topic);
            console.log(result);//test

            result.then(() => {
                console.log("unsub success");//test
                unsubResponseCallback(this.SUCCEEDED);
                //remove from dictionary
                this.callbacksByTopics.delete(topic);
                console.log(this.callbacksByTopics);//test
            }).catch((err: any) => {
                console.log("unsub rejected");//test
                unsubResponseCallback(this.REJECTED);
            });
        }
    }

}