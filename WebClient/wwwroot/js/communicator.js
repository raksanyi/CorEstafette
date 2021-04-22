
function communicator() {

    this.publish = function (topic, message) {
        console.log("Client called publish method");
    }

    this.subscribe = function (topic) {
        console.log("Client called subscribe method");
    }

    this.unsubscribe = function (topic) {
        console.log("Client called unsubscribe method");
    }
}

function subscribeTest() {
    console.log("Client called subscribe method");
}

function publishTest() {
    console.log("Client called publish method");
}

function unsubscribeTest() {
    console.log("Client called unsubscribe method");
}