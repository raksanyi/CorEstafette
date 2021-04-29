using System;
using Newtonsoft.Json;

namespace Shared
{
    [Serializable]
    internal class Message : IMessage
    {
        [JsonProperty]
        public string CorrelationId { get; set; }

        [JsonProperty]
        public string Content { get; set; }

        [JsonProperty]
        public string Sender { get; set; }

        [JsonProperty]
        public DateTime Timestamp { get; set; }

    }
}
