using System;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
//using CorEstafette.Hubs.Message;
using Newtonsoft.Json;


//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{

    public class Message
    {
        public string correlationId { get; set; }
        public string content { get; set; }
        public string sender { get; set; }
        public string topic { get; set; }
    }

    public class Response
    {
        public Response(Message message, bool success)
        {
            this.correlationId = message.correlationId;
            this.content = message.content;
            this.sender = message.sender;
            this.topic = message.topic;
            this.success = success;
        }

        public Response(string correlationId, string content, string sender, string topic, bool success)
        {
            this.correlationId = correlationId;
            this.content = content;
            this.sender = sender;
            this.topic = topic;
            this.success = success;
        }

        public string correlationId { get; set; }
        public string content { get; set; }
        public string sender { get; set; }
        public string topic { get; set; }
        public bool success { get; set; }

    }

    public class TestHub : Hub
    {

        public async Task SendMessageAsync(string user, string message) //can be called by a connected client
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SubscribeTopicAsync(Message message)
        {
            //System.Console.WriteLine("hello");
            await Groups.AddToGroupAsync(Context.ConnectionId, message.topic);
            //Turn IMessage to IResponse
            //Send the IResponse
            //var responseToSend = new Response(message.correlationId, message.content, message.sender, message.topic, true);
            var responseToSend = new Response(message, true);
            await Clients.Group(responseToSend.topic).SendAsync("ReceiveGroup", responseToSend);
        }

        public async Task UnsubscribeTopicAsync(Message message)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, message.topic);
            var responseToSend = new Response(message, true);
            await Clients.Group(responseToSend.topic).SendAsync("ReceiveGroup", responseToSend);
            //await Clients.Group(topic).SendAsync("ReceiveGroup", $"{Context.ConnectionId} has lefted the group {topic}.");

        }

        //public async Task SubscribeTopicAsync(string topic)
        //{
        //    //System.Console.WriteLine("hello");
        //    await Groups.AddToGroupAsync(Context.ConnectionId, topic);
        //    //Turn IMessage to IResponse
        //    //Send the IResponse
        //    //await Clients.Group(topic).SendAsync("ReceiveGroup", $"{Context.ConnectionId} has joined the group {topic}.");
        //}

        //public async Task UnsubscribeTopicAsync(string topic)
        //{
        //    await Groups.RemoveFromGroupAsync(Context.ConnectionId, topic);
        //    //await Clients.Group(topic).SendAsync("ReceiveGroup", $"{Context.ConnectionId} has lefted the group {topic}.");

        //}

        //public async Task PublishMessageAsync(string user, string topic, string message) //can be called by a connected client
        //{
        //    await Clients.Group(topic).SendAsync("ReceiveMessage", user, message);

        //}

        public async Task PublishMessageAsync(Message message) //can be called by a connected client
        {
            await Clients.Group(message.topic).SendAsync("ReceiveMessage", message);
        }

    }
}
