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
        public string CorrelationId { get; set; }
        public string Content { get; set; }
        public string Sender { get; set; }
        public string Topic { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class Response
    {
        public Response(Message message, bool success)
        {
            this.CorrelationId = message.CorrelationId;
            this.Content = message.Content;
            this.Sender = message.Sender;
            this.Topic = message.Topic;
            this.Success = success;
        }

        public Response(string correlationId, string content, string sender, string topic, bool success)
        {
            this.CorrelationId = correlationId;
            this.Content = content;
            this.Sender = sender;
            this.Topic = topic;
            this.Timestamp = new DateTime();
            this.Success = success;
        }

        public string CorrelationId { get; set; }
        public string Content { get; set; }
        public string Sender { get; set; }
        public string Topic { get; set; }
        public DateTime Timestamp { get; set; }
        public bool Success { get; set; }

    }

    public class TestHub : Hub
    {
        public async Task PublishAsync(Message message)
        {
            await Clients.GroupExcept(message.Topic, Context.ConnectionId).SendAsync("OnPublish", message);
        }

        public async Task<Response> SubscribeTopicAsync(Message message)
        {
            //Test for timeout in communicator
            //System.Threading.Thread.Sleep(4000);
            await Groups.AddToGroupAsync(Context.ConnectionId, message.Topic);
            var responseToSend = new Response(message, true);
            await Clients.Caller.SendAsync("OnSubscribe", responseToSend);
            return responseToSend;
        }

        public async Task<Response> UnsubscribeTopicAsync(Message message)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, message.Topic);
            var responseToSend = new Response(message, true);
            await Clients.Caller.SendAsync("OnUnsubscribe", responseToSend);
            return responseToSend;
        }

    }
}
