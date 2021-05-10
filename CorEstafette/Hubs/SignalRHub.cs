using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using SignalRCommunicator;
using System;
using System.Collections.Concurrent;
using System.Diagnostics;

//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{
    public class SignalRHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> ConnectedClients = new();
        private static readonly ConcurrentDictionary<string, TaskCompletionSource<IResponse>> responsesByCorrelationIds = new();
        private static readonly ConcurrentDictionary<string, string> RespondersList = new();
        private readonly HubClient hubClient;

        public SignalRHub(HubClient hubClient)
        {
            this.hubClient = hubClient;
        }

        public async Task<IResponse> ConnectAsync(string userName)
        {
            return await hubClient.ConnectAsync(userName, Context.ConnectionId);
        }

        public IResponse AddResponder(string userName)
        {
            return hubClient.AddResponder(userName);
        }

        internal bool VerifyResponderIsInList(string userName)
        {
            return hubClient.VerifyResponderIsInList(userName);
        }
        //publish message to a particular topic
        public async Task PublishAsync(Message message)
        {
            await hubClient.PublishAsync(message, Context.ConnectionId);
        }

        //method for client to subscribe for a topic
        public async Task<IResponse> SubscribeTopicAsync(Message message)
        {
            return await hubClient.SubscribeTopicAsync(message, Context.ConnectionId);
        }

        //method for client to unsubscribe from a topic
        public async Task<IResponse> UnsubscribeTopicAsync(Message message)
        {
            return await hubClient.UnsubscribeTopicAsync(message, Context.ConnectionId);
        }

        public async Task<IResponse> QueryAsync(Request request)
        {
            return await hubClient.QueryAsync(request);
        }

        public void RespondQueryAsync(Response response)
        {
            hubClient.RespondQueryAsync(response);
        }

        //public override Task OnDisconnectedAsync(System.Exception exception)
        //{
        //    string userName = "";
        //    foreach (var pair in ConnectedClients)
        //    {
        //        if (pair.Value == Context.ConnectionId)
        //            userName = pair.Key;
        //    }

        //    ConnectedClients.TryRemove(userName, out _);
        //    RespondersList.TryRemove(userName, out _);
        //    return base.OnDisconnectedAsync(exception);
        //}
    }

}
