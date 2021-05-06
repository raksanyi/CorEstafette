# CorEstafette 

## Overview

* This project provide a cross-machine communication solution for WPF-based desktop applications and web applications using SignalR and .NET Core 


## Components
* A SignalR server and connection hub
* Implement separate communicators which provide APIs for WPF and web clients to connect to the SignalRServer (on localhost & cloud), and send message to other clients.
* A WPF client and a Web client which could connect to the service, sending & receiving messages of the following types:
    * Topic based messages
        * Subscribe to and unsubscribe from topic(s)
        * Publish messages from client to server
        * Broadcast messages from server to topic subscribers
    * Request/response messages
        * Request a message from another client with its user name
        * Respond to a request made by another client

