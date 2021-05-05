 using Microsoft.AspNetCore.SignalR;
using System.Threading;
using System.Threading.Tasks;
using SignalRCommunicator;
using System.Collections.Generic;
using System;
using System.Diagnostics;
using System.Collections.Concurrent;



//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{

    public class Request
    {


        public string CorrelationId { get; set; }
        public string Content { get; set; }
        public string Sender { get; set; }
        public string Topic { get; set; }
        public DateTime TimeStamp { get; set; }
        public string Destination { get; set; }
    }



    public class SignalRHub : Hub
    {

        static private ConcurrentDictionary<string, string> ConnectedClients = new ConcurrentDictionary<string, string>();
    
        private static ConcurrentDictionary<string, string> responsesByConnectionsIds = new ConcurrentDictionary<string, string>();

        //public override Task OnConnectedAsync()
        //{
        //    System.Threading.Thread.Sleep(4000);//test timeout
        //    return base.OnConnectedAsync();
        //}

        //cache the connection's name and id; return a success response if the connection is valid;
        // return a failure response if the connection's name is already in used
        public async Task<IResponse> ConnectAsync(string userName)
        {
            bool success = ConnectedClients.TryAdd(userName, Context.ConnectionId);
            IResponse res = new Response("", success);
            foreach (var kvp in ConnectedClients) { Debug.WriteLine(kvp.Key + " " + kvp.Value); } //test
            return res;
        }

        //remove the connection from the cache
        public override Task OnDisconnectedAsync(Exception exception)
        {
            //var connName = Context.GetHttpContext().Request.Query["name"];
            foreach (var kvp in ConnectedClients)
            {
                if (kvp.Value == Context.ConnectionId)
                {
                    string userName = kvp.Key;
                    ConnectedClients.TryRemove(userName, out string connectId);
                }
            }
            //test
            Debug.WriteLine("print dict in onDisconnectedAsync");
            foreach (var kvp in ConnectedClients) {Debug.WriteLine(kvp.Key + " " + kvp.Value);}
            return base.OnDisconnectedAsync(exception);
        }

        //publish message to a particular topic
        public async Task PublishAsync(Message message)
        {
            await Clients.OthersInGroup(message.Topic).SendAsync("OnPublish", message);
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

        //public async Task QueryAsync(Request request)
        //{
        //    await Clients.Client(namesByConnectionsIds[request.Destination]).SendAsync("OnQuery", request);

        //}

        public async Task QueryAsync(Request requestRecived)
        {
            try
            {
                await Clients.Client(ConnectedClients[requestRecived.Destination]).SendAsync("OnQuery", requestRecived);
            }
            catch (Exception e)
            {
                throw new HubException("This error will be sent to the client!" + e);
            }
            

        }


        //public async Task RespondQueryAsync(Response response)
        //{
           
        //   await Clients.Client(namesByConnectionsIds[response.Sender]).SendAsync("OnResponse", response);
        //}



    }

  
}