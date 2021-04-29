using System;
using System.Threading.Tasks;

namespace Shared
{
    public interface ICommunicator
    {
        /// <summary>
        /// Subscribe to a topic to receive the messages from this topic
        /// </summary>
        /// <param name="topic">The name of the topic to be subscribed to</param>
        /// <param name="callBack">Handles the response</param>
        /// <returns></returns>
        Task<string> SubscribeAsync(string topic, Func<string, Task> callBack);

        /// <summary>
        /// Unsuscribe for a topic to stop receiving the messages from this topic
        /// </summary>
        /// <param name="topic">The name of the topic to unsubscribe from</param>
        /// <returns></returns>
        Task<string> UnsubscribeAsync(string topic);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="topic"></param>
        /// <param name="message"></param>
        /// <returns></returns>

        Task PublishAsync(string topic, string message);
    }
}