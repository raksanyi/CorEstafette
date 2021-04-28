import * as signalR from "@microsoft/signalr";
import { Communicator } from "./communicator";

let comm = new Communicator();

//callback for receiving messages
let onReceive = function (user: string, message: string) {
    console.log("onReceive called in site.ts");
    let msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let encodedMsg = user + " says " + msg + " under topic ";
    let li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
}

//callback for subscribe response
let onSubscribe = function (statuscode : number) {
    if (statuscode == 0) {
        let li = document.createElement("li");
        li.textContent = "subscription success";
        document.getElementById("messagesList").appendChild(li);
    } else {
        let li = document.createElement("li");
        li.textContent = "subscription failed";
        document.getElementById("messagesList").appendChild(li);
    }
}

document.getElementById("subscribeButton").addEventListener("click", function () {
    let user = (<HTMLInputElement>document.getElementById("userInput")).value;
    let topic = (<HTMLInputElement>document.getElementById("topicInput")).value;
    comm.subscribeAsync(topic, onReceive, onSubscribe);
});

document.getElementById("publishButton").addEventListener("click", function () {
    let user = (<HTMLInputElement>document.getElementById("userInput")).value;
    let topic = (<HTMLInputElement>document.getElementById("topicInput")).value;
    let message = (<HTMLInputElement>document.getElementById("messageInput")).value;
    comm.publish(user, topic, message);

});

document.getElementById("unsubscribeButton").addEventListener("click", function () {
    let user = (<HTMLInputElement>document.getElementById("userInput")).value;
    let topic = (<HTMLInputElement>document.getElementById("topicInput")).value;
    comm.unsubscribeAsync(topic);
});