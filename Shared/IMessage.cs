using System;

namespace Shared
{
    public interface IMessage
    {
        string CorrelationId { get; }
        string Content { get; }
        string Sender { get; }
        DateTime Timestamp { get; }
    }
}
