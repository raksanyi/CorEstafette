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

        public async Task<IResponse> ConnectAsync(string userName)
        {
            var success = UserConnections.TryAdd(userName, Context.ConnectionId);
            string content = $"Username {userName} {(success ? "added successfully" : "already exists")} in the repertory.";
            return new Response(userName, null, content, true);
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

            UserConnections.TryRemove(userName, out string connectId);
            return base.OnDisconnectedAsync(exception);
        }
    }
}