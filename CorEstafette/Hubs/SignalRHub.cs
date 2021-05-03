using System;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
//using CorEstafette.Hubs.Message;
using Newtonsoft.Json;


//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{
    [Serializable]
    public class Message
    {

        [JsonProperty]
        public string CorrelationId { get; set; }
        [JsonProperty]
        public string Content { get; set; }
        [JsonProperty]
        public string Sender { get; set; }
        [JsonProperty]
        public string Topic { get; set; }
        [JsonProperty]
        public DateTime TimeStamp { get; set; }

    }
    [Serializable]
    public class Response
    {
    
        [JsonProperty]
        public string CorrelationId { get; set; }
        [JsonProperty]
        public string Content { get; set; }
        [JsonProperty]
        public string Sender { get; set; }
        [JsonProperty]
        public string Topic { get; set; }
        [JsonProperty]
        public DateTime TimeStamp { get; set; }
        [JsonProperty]
        public bool Success { get; set; }

        public Response(Message message, bool success)
        {

            this.CorrelationId = message.CorrelationId;
            this.Content = message.Content;
            this.Sender = message.Sender;
            this.Topic = message.Topic;
            this.TimeStamp = new DateTime();
            this.Success = success;
        }

    }

    public class SignalRHub : Hub
    {
        public async Task PublishAsync(Message message)
        {
            await Clients.GroupExcept(message.Topic, Context.ConnectionId).SendAsync("OnPublish", message);
            //await Clients.Group(message.Topic).SendAsync("OnPublish", message);
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
