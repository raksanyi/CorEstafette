"use strict";

import Communicator from "./communicator.js";

let comm = new Communicator();

comm.connection.on("ReceiveMessage", function (user, message) {
    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var encodedMsg = user + " says " + msg;
    var li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
});

comm.connection.on("ReceiveGroup", function (message) {
    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var encodedMsg = msg;
    var li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
});

document.getElementById("subscribeButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var topic = document.getElementById("topicInput").value;

    comm.subscribe(user, topic);

});

document.getElementById("publishButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var topic = document.getElementById("topicInput").value;
    var message = document.getElementById("messageInput").value;

    comm.publish(user, topic, message);

});

document.getElementById("unsubscribeButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var topic = document.getElementById("topicInput").value;

    comm.unsubscribe(user, topic);

});