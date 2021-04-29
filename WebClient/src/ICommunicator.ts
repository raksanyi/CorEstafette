
export interface ICommunicator {
    //publish message under certain topic
    publish: (topic: string, message: string) => any;
    //subscribe to a topic, store the callback function for that topic, and invoke responseCallback
    subscribeAsync: (topic: string, topicCallback: (arg1: string, arg2: string) => any, subResponseCallback: (arg1: number) => any) => Promise<void>;
    //unsubscribe from a topic, remove the cached callback, and invoke responseCallback
    unsubscribeAsync: (topic: string, unsubResponseCallback: (arg1: number) => any) => Promise<void>;
}