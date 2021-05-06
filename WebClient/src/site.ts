import { Communicator } from "./communicator";
import { IResponse } from "./IResponse";
import { IMessage } from "./IMessage";
import { IRequest } from "./IRequest";
import { ICommunicator } from "./ICommunicator";

let comm: ICommunicator;


let onConnect = function (response: IResponse) {
    console.log(onConnect);
    let msg = response.Content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let li = document.createElement("li");
    li.textContent = msg;
    document.getElementById("messagesList").appendChild(li);
}

//callback for receiving messages
let onReceive = function (message: IMessage) {
    //console.log(message);
    let msg = message.Content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let encodedMsg = msg + " under topic " + message.Topic;
    let li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
}

let onRequest = function (request: IRequest): string {
    console.log("Received request from");
    let encodedMsg = "Received request from " + request.Sender;
    let li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
    return request.Content;
}

document.getElementById("connectButton").addEventListener("click", function () {
    let user = (<HTMLInputElement>document.getElementById("userName")).value;
    comm = new Communicator(user, onConnect);
    comm.addResponder(user, onRequest);
});

//Add user callback to responder map
//move to constructor later?
//comm.addResponder("user", onRequest);



document.getElementById("subButton").addEventListener("click", function () {
    let topic = (<HTMLInputElement>document.getElementById("subTopic")).value;
    let result = comm.subscribeAsync(topic, onReceive);
    result.then((res: any) => {
        //test
        //const messageReceived: IResponse = <IResponse>res;
        //console.log(messageReceived);
        let li = document.createElement("li");
        li.textContent = "subscription success";
        document.getElementById("messagesList").appendChild(li);
    }).catch((err: any) => {
        console.log(err);
        let li = document.createElement("li");
        li.textContent = "subscription failed";
        document.getElementById("messagesList").appendChild(li);
    });
});

document.getElementById("publishButton").addEventListener("click", function () {
    let topic = (<HTMLInputElement>document.getElementById("publishTopic")).value;
    let message = (<HTMLInputElement>document.getElementById("publishMessage")).value;
    comm.publish(topic, message);

});

document.getElementById("unsubButton").addEventListener("click", function () {
    let topic = (<HTMLInputElement>document.getElementById("subTopic")).value;
    let result = comm.unsubscribeAsync(topic);
    result.then((res : any) => {
            //test
            //const messageReceived: IResponse = <IResponse>res;
            //console.log(messageReceived);
            let li = document.createElement("li");
            li.textContent = "unsubscription success";
            document.getElementById("messagesList").appendChild(li);
    }).catch((err: any) => {
            console.log(err);
            let li = document.createElement("li");
            li.textContent = "unsubscription failed";
            document.getElementById("messagesList").appendChild(li);
        });

});

document.getElementById("requestButton").addEventListener("click", function () {
   // let topic = (<HTMLInputElement>document.getElementById("additionalData")).value;

    let additionalData = (<HTMLInputElement>document.getElementById("additionalData")).value;
    let responder = (<HTMLInputElement>document.getElementById("responder")).value;

    
    //comm.queryAsync(responder, additionalData);
    //comm.addResponder(responder, onRequest);
    
    let result = comm.queryAsync(responder, additionalData);

    result.then((res: any) => {
        //test
        const messageReceived: IResponse = <IResponse>res;
        console.log(messageReceived);
        let li = document.createElement("li");
        li.textContent = "Received " + messageReceived.Content;
        document.getElementById("messagesList").appendChild(li);
    }).catch((err: any) => {
        console.log(err);
        let li = document.createElement("li");
        li.textContent = "unsubscription failed";
        document.getElementById("messagesList").appendChild(li);
    });
    

})

document.getElementById("disconnectButton").addEventListener("click", function () {
    let result = comm.disconnectAsync();
    result.then((res) => {
        let li = document.createElement("li");
        li.textContent = "disconnected";
        document.getElementById("messagesList").appendChild(li);
    }).catch((err: any) => {
        let li = document.createElement("li");
        li.textContent = "failed to disconnect";
        document.getElementById("messagesList").appendChild(li);
    });
});