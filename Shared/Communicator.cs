using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;

namespace SignalRCommunicator
{
    internal class Communicator :ICommunicator
    {
        private readonly HubConnection connection;
        private readonly Dictionary<string, Func<string, Task>> callBackTopics;
        private readonly Dictionary<string, Func<IRequest, Task<Object>>> callBackByResponder;
        private readonly string UserId;
        
        public Communicator()
        {
            callBackTopics = new Dictionary<string, Func<string, Task>>();
            callBackByResponder = new Dictionary<string, Func<IRequest, Task<Object>>>();
            UserId = "User" + new Random().Next(1, 50);
            connection = new HubConnectionBuilder()
                .WithUrl("https://localhost:44392/signalrhub")
                .Build();

            _ = Task.Run(async () => { 
                await connection.StartAsync();
                await connection.InvokeAsync<Response>("ConnectAsync", UserId);
            });
            connection.Closed += async (error) =>
            {
                await Task.Delay(new Random().Next(0, 5) * 1000);
                await connection.StartAsync();
                await connection.InvokeAsync<Response>("ConnectAsync", UserId);
            };

            connection.On<Message>(nameof(OnPublish), OnPublish);
            connection.On<Request>(nameof(OnQuery), OnQuery);
        }
        private async Task OnPublish(Message message)
        {
            await callBackTopics[message.Topic]($"{message.Sender} published : {message.Content} on topic {message.Topic}");
        }

        private async Task OnQuery(IRequest request)
        {
            Debug.WriteLine($"{nameof(OnQuery)}: correlation id: {request.CorrelationId}");
            Debug.WriteLine($"{nameof(OnQuery)}: called with {request.Content}.");
            var clientResultTask = callBackByResponder[request.Responder](request);
            var timeoutTask = Task.Delay(1000);
            var resultTask = await Task.WhenAny(clientResultTask, timeoutTask);

            if(resultTask == timeoutTask)
            {
                Debug.WriteLine($"{nameof(OnQuery)}: timed out after 5 seconds.");
                await connection.InvokeAsync("RespondQueryAsync", new Response(UserId, "topic", "OnQuery on Communicator timed out.", false));
                return;
            }
            Debug.WriteLine($"{nameof(OnQuery)}: got the results from the client, {clientResultTask.Result}.");
            await connection.InvokeAsync<Response>("RespondQueryAsync", new Response(true, request.CorrelationId, null, clientResultTask.Result.ToString(), request.Sender, request.Timestamp));
        }

        public async Task<IResponse> SubscribeAsync(string topic, Func<string, Task> callBack)
        {
            if (callBackTopics.ContainsKey(topic))
                return null;
            
            IMessage message = new Message(topic, null, UserId);
            Task<Response> subscribeTask = connection.InvokeAsync<Response>("SubscribeTopicAsync", message);
            var timeOutTask = Task.Delay(5000);
            var completed = await Task.WhenAny(subscribeTask, timeOutTask);

            if (completed != subscribeTask)
                return new Response(
                    $"Subscription to topic {message.Topic} failed du to a Timeout error.",
                    false);
                        
            callBackTopics[topic] = callBack;
            return subscribeTask.Result;
        }

        public async Task<IResponse> UnsubscribeAsync(string topic)
        {
            if (!callBackTopics.ContainsKey(topic))
                return new Response(topic,
                    $"Can't unsubscribe from {topic} since it wasn't subscribed to", 
                    false);

            IMessage message = new Message(topic, null, UserId);
            Task<Response> unsubscribeTask = connection.InvokeAsync<Response>("UnsubscribeTopicAsync", message);
            var timeOutTask = Task.Delay(5000);
            
            var completed = await Task.WhenAny(unsubscribeTask, timeOutTask);

            if (completed != unsubscribeTask)
                return new Response(
                    $"Unsubscription from topic {topic} failed du to a timeout error.",
                    false);

            callBackTopics.Remove(topic);
            return unsubscribeTask.Result;
        }

        public async Task PublishAsync(string topic, string content)
        {
            IMessage message = new Message(topic, content, UserId);
            await connection.InvokeAsync("PublishAsync", message);
        }

        public async Task<IResponse> AddResponder(string responder, Func<IRequest, Task<Object>> callBack)
        {
            Response response = await connection.InvokeAsync<Response>("AddResponder", responder);
            if (!response.Success)
            {
                if (callBackByResponder.ContainsKey(responder))
                {
                    callBackByResponder.Remove(responder);
                }
                return response;
            }
            bool success = callBackByResponder.TryAdd(responder, callBack);
            return response;
        }

        public async Task<IResponse> QueryAsync(string responder, string additionalData)
        {
            Debug.WriteLine($"{nameof(QueryAsync)}: called with responder {responder} and additional data {additionalData}.");
            IRequest request = new Request(responder, additionalData, UserId);
            //IResponse response = await connection.InvokeAsync<Response>("VerifyResponderIsInList", responder);
            /*if (!response.Success)
                return response;*/
            Debug.WriteLine($"{nameof(QueryAsync)}: correlation id: {request.CorrelationId}");
            var queryTask = connection.InvokeAsync<Response>("QueryAsync", request);
            var timeoutTask = Task.Delay(5000);
            var resultTask = await Task.WhenAny(queryTask, timeoutTask);

            if(resultTask == queryTask)
            {
                Debug.WriteLine($"{nameof(QueryAsync)}: got the result, {queryTask.Result.Content}.");
                return queryTask.Result;
            }

            Debug.WriteLine($"{nameof(QueryAsync)}: timed out.");
            return new Response("sender", "topic", "QueryAsync on Communicator timed out.", false);
            //return callBackByResponder.TryAdd(responder, callBack);
        }
    }
}
