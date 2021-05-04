using Microsoft.AspNetCore.SignalR;
using System.Threading;
using System.Threading.Tasks;
using SignalRCommunicator;
using System.Collections.Generic;
using System;
using System.Diagnostics;


//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{
    public class SignalRHub : Hub
    {

        static private Dictionary<string, string> connectedClients = new Dictionary<string, string>();


        public override Task OnConnectedAsync()
        {
            var connName = Context.GetHttpContext().Request.Query["name"];
            if (connectedClients.ContainsKey(connName))
            {
                //Debug.WriteLine("duplicate key");
                //var tcs = new TaskCompletionSource();
                //tcs.TrySetCanceled();
                //return tcs.Task;
                IResponse reject = new Response("", false);
                Clients.Caller.SendAsync("OnConnect", reject);
            }
            else
            {
                connectedClients.Add(connName, Context.ConnectionId);
                IResponse resolved = new Response("", true);
                Clients.Caller.SendAsync("OnConnect", resolved);
            }
            //test
            Debug.WriteLine("print dict in onConnectedAsync");
            foreach (var kvp in connectedClients) { Debug.WriteLine(kvp.Key + " " + kvp.Value); }
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            var connName = Context.GetHttpContext().Request.Query["name"];
            if (!connectedClients.ContainsKey(connName)) {
                return null;
            } else {
                connectedClients.Remove(connName);
            }
            //test
            Debug.WriteLine("print dict in onDisconnectedAsync");
            foreach (var kvp in connectedClients) {Debug.WriteLine(kvp.Key + " " + kvp.Value);}
            return base.OnDisconnectedAsync(exception);
        }

        public async Task PublishAsync(Message message)
        {
            await Clients.OthersInGroup(message.Topic).SendAsync("OnPublish", message);
        }

        //method for client to subscribe for a topic
        public async Task<IResponse> SubscribeTopicAsync(Message message)
        {
            //System.Threading.Thread.Sleep(4000);
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
    }
}