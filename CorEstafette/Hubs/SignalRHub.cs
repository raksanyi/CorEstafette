using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using SignalRCommunicator;
using System.Collections.Concurrent;
using Newtonsoft.Json;
using System;

//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{
    public class SignalRHub : Hub
    {
        public async Task PublishAsync(Message message)
        {
            await Clients.GroupExcept(message.Topic, Context.ConnectionId).SendAsync("OnPublish", message);
        }

        //method for client to subscribe for a topic
        public async Task<IResponse> SubscribeTopicAsync(Message message)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, message.Topic);
            message.Content = $"{message.Sender} successfully subscribed to topic {message.Topic}";
            return new Response(message, true);
        }

        //method for client to unsubscribe from a topic
        public async Task<IResponse> UnsubscribeTopicAsync(Message message)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, message.Topic);
            message.Content = $"{message.Sender} successfully unsubscribe from topic {message.Topic}";
            return new Response(message, true);
        }

        private static ConcurrentDictionary<string, string> namesByConnectionsIds = new ConcurrentDictionary<string, string>();

        public async Task QueryAsync(Request request)
        {
            await Clients.Client(namesByConnectionsIds[request.Destination]).SendAsync("OnQuery", request);
        }

        public async Task RespondQueryAsync(Response response)
        {
           await Clients.Client(namesByConnectionsIds[response.Sender]).SendAsync("OnResponse", response);
        }

        //public async Task QueryAsync(string responder, string additionalData)
        //{
        //    await Clients.Client(namesByConnectionsIds.GetOrAdd(responder, "")).SendAsync("OnQuery", request);
        //}

        //public Response ConnectAsync(string ClientName)
        //{
        //    return new Response();
        //}
    }

    [Serializable]
    public class Request
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
        public string Destination { get; set; }
    }
}