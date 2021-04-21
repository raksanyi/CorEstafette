using System;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

//Hub manages connection, group, messaging
namespace CorEstafette.Hubs
{
    public class TestHub : Hub
    {
        public async Task SendMessage(string user, string message) //can be called by a connected client
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
        //method for client to subscribe for a topic
        //method for client to unsubscribe from a topic
        //method for client to publish a message under a topic
    }
}
