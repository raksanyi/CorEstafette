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
        public async Task PublishAsync(Message message)
        {
            
            await Clients.GroupExcept(message.topic, Context.ConnectionId).SendAsync("OnPublish", message);
        }

        public async Task<Response> SubscribeTopicAsync(Message message)
        {
            //Test for timeout in communicator
            //System.Threading.Thread.Sleep(4000);
            await Groups.AddToGroupAsync(Context.ConnectionId, message.topic);
            var responseToSend = new Response(message, true);
            await Clients.Caller.SendAsync("OnSubscribe", responseToSend);
            return responseToSend;
        }

        public async Task<Response> UnsubscribeTopicAsync(Message message)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, message.topic);
            var responseToSend = new Response(message, true);
            await Clients.Caller.SendAsync("OnUnsubscribe", responseToSend);
            return responseToSend;
        }

    }
}
