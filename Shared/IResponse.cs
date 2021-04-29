namespace Shared
{
    public interface IResponse : IMessage
    {
        bool Success { get; }
    }
}
