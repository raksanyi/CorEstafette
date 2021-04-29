using System;
using Newtonsoft.Json;

namespace Shared
{
    [Serializable]
    internal class Response : IResponse
    {
        [JsonProperty]
        public string CorrelationId { get; set; }

        [JsonProperty]
        public string Content { get; set; }

        [JsonProperty]
        public string Sender { get; set; }

        [JsonProperty]
        public DateTime Timestamp { get; set; }

        [JsonProperty]
        public bool Success { get; set; }

        public Response()
        {
            CorrelationId = Guid.NewGuid().ToString();
        }

        public Response( string content, string sender, DateTime timestamp, bool success ) : this()
        {
            Content = content;
            Sender = sender;
            Timestamp = timestamp;
            Success = success;
        }
    }
}
