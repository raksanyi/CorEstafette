export default class Communicator {

    constructor() {
        this.connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:5001/testhub").build();
        this.connection.start();
    }

    startConnection() {
        this.connection.start();
    }

    publish(user, message) {
        console.log("Client called publish method");
        this.connection.invoke("SendMessage", user, message);

    }


}