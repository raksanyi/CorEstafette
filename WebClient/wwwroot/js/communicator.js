
var communicator = {
    publish: function (topic, message) {
        console.log("Client called publish method");
    }

    subscribe: function (topic) {
        console.log("Client called subscribe method");
    }

    unsubscribe: function (topic) {
        console.log("Client called unsubscribe method");
    }
}