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

    public class TestHub : Hub
    {

        public async Task SendMessageAsync(string user, string message) //can be called by a connected client
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SubscribeTopicAsync(string topic)
        {
            //System.Console.WriteLine("hello");
            await Groups.AddToGroupAsync(Context.ConnectionId, topic);
            //await Clients.Group(topic).SendAsync("ReceiveGroup", $"{Context.ConnectionId} has joined the group {topic}.");
        }

        public async Task UnsubscribeTopicAsync(string topic)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, topic);
            //await Clients.Group(topic).SendAsync("ReceiveGroup", $"{Context.ConnectionId} has lefted the group {topic}.");

        }

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
