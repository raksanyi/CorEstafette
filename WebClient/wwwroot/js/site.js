import { Communicator } from "./communicator";
var comm = new Communicator();
//callback for receiving messages
var onReceive = function (user, message) {
    console.log("onReceive called in site.ts");
    var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var encodedMsg = user + " says " + msg + " under topic ";
    var li = document.createElement("li");
    li.textContent = encodedMsg;
    document.getElementById("messagesList").appendChild(li);
};
//callback for subscribe response
var onSubscribe = function (statuscode) {
    if (statuscode == 0) {
        var li = document.createElement("li");
        li.textContent = "subscription success";
        document.getElementById("messagesList").appendChild(li);
    }
    else {
        var li = document.createElement("li");
        li.textContent = "subscription failed";
        document.getElementById("messagesList").appendChild(li);
    }
};
document.getElementById("subscribeButton").addEventListener("click", function () {
    var user = document.getElementById("userInput").value;
    var topic = document.getElementById("topicInput").value;
    comm.subscribeAsync(topic, onReceive, onSubscribe);
});
document.getElementById("publishButton").addEventListener("click", function () {
    var user = document.getElementById("userInput").value;
    var topic = document.getElementById("topicInput").value;
    var message = document.getElementById("messageInput").value;
    comm.publish(user, topic, message);
});
document.getElementById("unsubscribeButton").addEventListener("click", function () {
    var user = document.getElementById("userInput").value;
    var topic = document.getElementById("topicInput").value;
    comm.unsubscribeAsync(topic);
});
//# sourceMappingURL=site.js.map