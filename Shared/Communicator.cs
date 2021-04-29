using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;

namespace Shared
{
    internal class Communicator :ICommunicator
    {
        private readonly HubConnection connection;
        private readonly Dictionary<string, Func<string, Task>> callBackTopics;

        public Communicator()
        {
            callBackTopics = new Dictionary<string, Func<string, Task>>();

            connection = new HubConnectionBuilder()
                .WithUrl("https://localhost:44392/testhub")
                .Build();

            _ = Task.Run(async () => { await connection.StartAsync(); });
            connection.Closed += async (error) =>
            {
                await Task.Delay(new Random().Next(0, 5) * 1000);
                await connection.StartAsync();
            };

            connection.On<string>(nameof(OnSubscribe), OnSubscribe);
            connection.On<string>(nameof(OnUnsubscribe), OnUnsubscribe);
            connection.On<string, string>(nameof(OnPublish), OnPublish);
        }

        private void OnSubscribe(string response)
        {
            Debug.WriteLine(response);
        }

        private void OnUnsubscribe(string response)
        {
            Debug.WriteLine(response);
        }

        private async Task OnPublish(string topic, string content)
        {
            await callBackTopics[topic](content);
        }
        public async Task<string> SubscribeAsync(string topic, Func<string, Task> callBack)
        {
            if (callBackTopics.ContainsKey(topic))
                return "fail";
            await connection.InvokeAsync("SubscribeTopicAsync", topic);
            if (callBack == null)
                return null;
            callBackTopics[topic] = callBack;
            return "success";
        }

        public async Task<string> UnsubscribeAsync(string topic)
        {
            if (!callBackTopics.ContainsKey(topic))
                return "fail";

            await connection.InvokeAsync("UnsubscribeTopicAsync", topic);
            callBackTopics.Remove(topic);
            return "success";
        }

        public async Task PublishAsync(String topic, String message)
        {
            await connection.InvokeAsync("PublishAsync", topic, message);
        }
    }
}
