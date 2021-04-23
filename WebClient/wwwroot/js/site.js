

document.getElementById("subscribeButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var topic = document.getElementById("topicInput").value;

    //let communicatorInstance = new communicator(null);
    //communicatorInstance.subscribe();

   // subscribeTest();


});

document.getElementById("publishButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var topic = document.getElementById("topicInput").value;
    var message = document.getElementById("messageInput").value;

    //publishTest();

});

document.getElementById("unsubscribeButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var topic = document.getElementById("topicInput").value;

    //unsubscribeTest();

});