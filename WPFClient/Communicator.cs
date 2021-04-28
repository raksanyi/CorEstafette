using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;
using CorEstafette;

namespace WPFClient
{
    class Communicator
    {
        private readonly HubConnection connection;
        private readonly List<string> subscribedTopics;

        public Communicator( )
        {
            subscribedTopics = new List<string>();
            connection = new HubConnectionBuilder()
                .WithUrl("https://localhost:44392/testhub")
                .Build();

            connection.StartAsync();
            connection.Closed += async (error) =>
            {
                await Task.Delay(new Random().Next(0, 5) * 1000);
                await connection.StartAsync();
            };
        }

        public async Task<string> SubscribeAsync(string topic)
        {
            if (FindSubscriptionIndex(topic) < 0)
            {
                await connection.InvokeAsync("SubscribeTopic", topic);
                subscribedTopics.Add(topic);
                return "success";
            }
            return "fail";
        }

        public async Task<string> UnsubscribeAsync(string topic)
        {
            int indexOfTopic = FindSubscriptionIndex(topic);

            if (indexOfTopic < 0)
                return "fail";

            await connection.InvokeAsync("UnsubscribeTopic", topic);
            subscribedTopics.RemoveAt(indexOfTopic);
            return "success";

        }

        public async Task PublishAsync(String topic, String message )
        {
            await connection.InvokeAsync("PublishAsync", topic, message);
            //return message == "" ? false : true;
            
        }

        private int FindSubscriptionIndex(String topic)
        {
            return subscribedTopics.IndexOf(topic);
        }
    }
}
