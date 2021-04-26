import * as signalR from "@microsoft/signalr";
import { Communicator } from "./communicator";

let comm = new Communicator();
comm.startConnection();
console.log(comm.connection);//test


comm.connection.on("ReceiveMessage", function (user : string, message : string) {
    let msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let encodedMsg = user + " says " + msg;
    let li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
});

comm.connection.on("ReceiveGroup", function (message : string) {
    let msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let encodedMsg = msg;
    let li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
});

document.getElementById("subscribeButton").addEventListener("click", function () {
    let user = (<HTMLInputElement>document.getElementById("userInput")).value;
    let topic = (<HTMLInputElement>document.getElementById("topicInput")).value;
    console.log(comm);
    comm.subscribeAsync(topic);
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