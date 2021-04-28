using System;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{
    public class TestHub : Hub
    {
        public async Task PublishAsync(string topic, string content)
        {
            await Clients.GroupExcept(topic, Context.ConnectionId).SendAsync("OnPublish", topic, content);
        }

        //method for client to subscribe for a topic
        public async Task SubscribeTopicAsync(string topic)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, topic);
            await Clients.Caller.SendAsync("OnSubscribe", $"Successfully subscribed to topic {topic}");
        }

        //method for client to unsubscribe from a topic
        public async Task UnsubscribeTopic(string topic)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, topic);
            await Clients.Caller.SendAsync("OnUnsubscribe", $"Successfully unsubscribed fron topic {topic}");
        }

        //method for client to publish a message under a topic
        public async Task PublishMessage(string user, string topic, string message) //can be called by a connected client
        {
            await Clients.Group(topic).SendAsync("ReceiveMessage", user, message);
        }
    }
}
