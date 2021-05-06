using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using SignalRCommunicator;
using System.Collections.Concurrent;

//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{
    public class SignalRHub : Hub
    {
        private static ConcurrentDictionary<string, string> UserConnections = new ConcurrentDictionary<string, string>();
        private static ConcurrentDictionary<string, TaskCompletionSource<IResponse>> responsesByCorrelationId = new ConcurrentDictionary<string, TaskCompletionSource<IResponse>>();

        public async Task<IResponse> ConnectAsync(string userName)
        {
            var success = UserConnections.TryAdd(userName, Context.ConnectionId);
            string content = $"Username {userName} {(success ? "added successfully" : "already exists")} in the repertory.";
            return new Response(userName, null, content, true);
        }

        public IResponse VerifyUserRegistered(string userName)
        {
            bool success = UserConnections.ContainsKey(userName);
            return new Response(null, $"{userName} is {(success ? "" : "not ")} in the repertory.", success);
        }
        public async Task PublishAsync(Message message)
        {
            await Clients.OthersInGroup(message.Topic).SendAsync("OnPublish", message);
        }

        //method for client to subscribe for a topic
        public async Task<IResponse> SubscribeTopicAsync(Message message)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, message.Topic);
            string str = Context.User.Identity.Name;
            string str2 = Context.UserIdentifier;
            
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

        public override Task OnDisconnectedAsync(System.Exception exception)
        {
            string userName = "";
            foreach( var pair in UserConnections)
            {
                if (pair.Value == Context.ConnectionId)
                    userName = pair.Key;
            }

            UserConnections.TryRemove(userName, out _);
            return base.OnDisconnectedAsync(exception);
        }

        public async Task<IResponse> QueryAsync(Request request)
        {
            responsesByCorrelationId[request.CorrelationId] = new TaskCompletionSource<IResponse>();

            await Clients.Client(UserConnections[request.Responder]).SendAsync("OnQuery", request);
            var responseTask = responsesByCorrelationId[request.CorrelationId].Task;
            var timeoutTask = Task.Delay(2000);
            var result = await Task.WhenAny(responseTask, timeoutTask);

            if(result == responseTask)
            {
                responsesByCorrelationId.TryRemove(request.CorrelationId, out var tcs);
                return tcs.Task.Result;
            }
            return new Response(false, request.CorrelationId, null, "Timeout error, query failed", request.Sender, request.Timestamp);
        }

        public void ResponseQueryAsync(Response response)
        {
            responsesByCorrelationId[response.CorrelationId].TrySetResult(response);
        }


    }
}