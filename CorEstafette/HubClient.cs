using CorEstafette.Hubs;
using Microsoft.AspNetCore.SignalR;
using SignalRCommunicator;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace CorEstafette
{
    public class HubClient
    {
        private static readonly ConcurrentDictionary<string, string> ConnectedClients = new();
        private static readonly ConcurrentDictionary<string, TaskCompletionSource<IResponse>> responsesByCorrelationIds = new();
        private static readonly ConcurrentDictionary<string, string> RespondersList = new();
        private readonly IHubContext<SignalRHub> hubContext;

        public HubClient(IHubContext<SignalRHub> hubContext)
        {
            this.hubContext = hubContext;
        }

        public async Task<IResponse> ConnectAsync(string userName, string connectionId)
        {
            bool success = ConnectedClients.TryAdd(userName, connectionId);
            IResponse res = new Response("", $"{userName} {(success ? "successfully registered" : "failed to register")} to the service", success);
            return res;
        }

        public IResponse AddResponder(string userName)
        {
            Debug.WriteLine($"{nameof(AddResponder)}: called with responder {userName}.");
            ConnectedClients.TryGetValue(userName, out string connId);
            if (connId != null)
            {
                bool success = RespondersList.TryAdd(userName, connId);
                Debug.WriteLine($"{nameof(AddResponder)}: {userName} was {(success ? "successfully added to" : "already in")} the Responser's list");
                return new Response(null, $"{userName} was {(success ? "successfully added to" : "already in")} the Responser's list", true);
            }
            Debug.WriteLine($"{nameof(AddResponder)}: {userName} is not registered on the service.");
            return new Response(null, $"{userName} is not registered on the service.", false);
        }

        internal bool VerifyResponderIsInList(string userName)
        {
            return RespondersList.ContainsKey(userName);
        }

        public async Task PublishAsync(Message message, string connectionId)
        {
            await hubContext.Clients.GroupExcept(message.Topic, connectionId).SendAsync("OnPublish", message).ConfigureAwait(false);
        }

        public async Task<IResponse> SubscribeTopicAsync(Message message, string connectionId)
        {
            await hubContext.Groups.AddToGroupAsync(connectionId, message.Topic).ConfigureAwait(false);

            message.Content = $"{message.Sender} successfully subscribed to topic {message.Topic}";
            return new Response(message, true);
        }

        public async Task<IResponse> UnsubscribeTopicAsync(Message message, string connectionId)
        {
            await hubContext.Groups.RemoveFromGroupAsync(connectionId, message.Topic).ConfigureAwait(false);
            message.Content = $"{message.Sender} successfully unsubscribe from topic {message.Topic}";
            return new Response(message, true);
        }

        public async Task<IResponse> QueryAsync(Request request)
        {

            //if(!VerifyResponderIsInList(request.Responder))
            //   return new Response(false, request.CorrelationId, null, $"Request failed, {request.Responder} is not in the Responder list.", request.Sender, DateTime.Now);
            Debug.WriteLine($"{nameof(QueryAsync)}: called with request {request.Content}, correlation id: {request.CorrelationId}.");
            responsesByCorrelationIds[request.CorrelationId] = new TaskCompletionSource<IResponse>();

            Debug.WriteLine($"{nameof(QueryAsync)}: before calling OnQuery on the ICommunicator.");
            await hubContext.Clients.Client(ConnectedClients[request.Responder]).SendAsync("OnQuery", request).ConfigureAwait(false);
            Debug.WriteLine($"{nameof(QueryAsync)}: after calling OnQuery on the ICommunicator.");

            var responseTask = responsesByCorrelationIds[request.CorrelationId].Task;
            var timeoutTask = Task.Delay(5000);
            var result = await Task.WhenAny(responseTask, timeoutTask).ConfigureAwait(false);

            if (result != responseTask)
            {
                Debug.WriteLine($"{nameof(QueryAsync)}: Timed out.");
                return new Response(false, request.CorrelationId, null, "Query failed after 2 second time out", "Signalr Hub", DateTime.Now);
            }

            if (result == responseTask)
            {
                responsesByCorrelationIds.TryRemove(request.CorrelationId, out var tcs);

                Debug.WriteLine($"{nameof(QueryAsync)}: got the result from Communicator: {tcs.Task.Result.Success}, {tcs.Task.Result.Content}.");
                return await tcs.Task;
            }

            return new Response(false, request.CorrelationId, null, "WTF???????,,", "Signalr Hub", DateTime.Now);
        }

        public void RespondQueryAsync(Response response)
        {
            Debug.WriteLine($"{nameof(RespondQueryAsync)}: correlation id: {response.CorrelationId}");
            Debug.WriteLine($"{nameof(RespondQueryAsync)}: got result: {response.Success}, {response.Content}.");
            bool success = false;
            if (responsesByCorrelationIds.TryGetValue(response.CorrelationId, out var obj) && obj is TaskCompletionSource<IResponse> source)
            {
                source.SetResult(response);
            }
            //var success = responsesByCorrelationIds[response.CorrelationId].TrySetResult(response);
            Debug.WriteLine($"{nameof(RespondQueryAsync)}: tried to set the result, result: {success}.");
        }
    }
}
