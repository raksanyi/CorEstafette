using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using SignalRCommunicator;
using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using System.Threading;

//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{
    public class SignalRHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> ConnectedClients = new();
        private static readonly ConcurrentDictionary<string, TaskCompletionSource<IResponse>> responsesByCorrelationIds = new();
        //private static readonly BlockingCollection<Tuple<string, TaskCompletionSource<IResponse>>> responsesByCorrelationIds = new();
        private static readonly ConcurrentDictionary<string, string> RespondersList = new();

        public async Task<IResponse> ConnectAsync(string userName)
        {
            bool success = ConnectedClients.TryAdd(userName, Context.ConnectionId);
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
        //publish message to a particular topic
        public async Task PublishAsync(Message message)
        {
            await Clients.OthersInGroup(message.Topic).SendAsync("OnPublish", message).ConfigureAwait(false);
        }

        //method for client to subscribe for a topic
        public async Task<IResponse> SubscribeTopicAsync(Message message)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, message.Topic).ConfigureAwait(false);

            message.Content = $"{message.Sender} successfully subscribed to topic {message.Topic}";
            return new Response(message, true);
        }

        //method for client to unsubscribe from a topic
        public async Task<IResponse> UnsubscribeTopicAsync(Message message)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, message.Topic).ConfigureAwait(false);
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
            await Clients.Client(ConnectedClients[request.Responder]).SendAsync("OnQuery", request).ConfigureAwait(false);
            Debug.WriteLine($"{nameof(QueryAsync)}: after calling OnQuery on the ICommunicator.");

            var responseTask = responsesByCorrelationIds[request.CorrelationId].Task;
            var timeoutTask = Task.Delay(5000);
            var result = await Task.WhenAny(responseTask, timeoutTask).ConfigureAwait(false);

            if(result != responseTask)
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
            var success = responsesByCorrelationIds[response.CorrelationId].TrySetResult(response); //responsesByCorrelationIds.First(tpl => tpl.Item1 == response.CorrelationId).Item2.TrySetResult(response);
            Debug.WriteLine($"{nameof(RespondQueryAsync)}: tried to set the result, result: {success}.");
        }

        public override Task OnDisconnectedAsync(System.Exception exception)
        {
            string userName = "";
            foreach (var pair in ConnectedClients)
            {
                if (pair.Value == Context.ConnectionId)
                    userName = pair.Key;
            }

            ConnectedClients.TryRemove(userName, out _);
            RespondersList.TryRemove(userName, out _);
            return base.OnDisconnectedAsync(exception);
        }
    }

}
