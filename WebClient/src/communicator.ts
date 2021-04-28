import * as signalR from "@microsoft/signalr";


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

    //status code
    SUCCEEDED = 0;
    REJECTED = 1;
    DUPLICATE_SUB = 2;
    DUPLICATE_UNSUB = 3;

    constructor() {
        this.connectionWrapper.establishConnection();
        this.callbacksByTopics = new Map();
        this.connectionWrapper.registerCallback("onPublish", (topic: string, message: string) => {
            console.log("inside receiveHandler");
            console.log(this.callbacksByTopics);
            //TODO: check if topic exists? 
            let topicCallback = this.callbacksByTopics.get(topic);
            topicCallback(topic, message);//TODO: add parameters list?
        });
    }

    //publish message under certain topic
    publish(user: string, topic: string, message: string) {
        console.log("Client called publish method");
        this.connectionWrapper.connection.invoke("PublishAsync", topic, message);
    }

    //subscribe to a topic, store the callback function for that topic, and invoke responseCallback for state of subscription
    async subscribeAsync(topic: string, topicCallback: Function, subResponseCallback: Function) {
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

    async unsubscribeAsync(topic: string, unsubResponseCallback: Function) {
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