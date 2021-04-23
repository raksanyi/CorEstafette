using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Prism.Commands;

namespace WPFClient
{
    class ClientModelView : INotifyPropertyChanged
    {
        private Communicator communicator = new Communicator();

        public ClientModelView() 
        {
            PublishMessage = new DelegateCommand(() =>
            {
                // Post with communicator here and wait for reply, THEN post message
                LogMessages = $"New message posted! Topic:{Topic} Message:{Content}{Environment.NewLine}{LogMessages}";
                OnPropertyChanged(nameof(LogMessages));
            });

            // Keeping the async line commented, will put back as soon as the communicator is properly implemented
            //SubscribeCommand = new DelegateCommand(async () =>
            SubscribeCommand = new DelegateCommand(() =>
            {

                bool success = communicator.Subscribe(SubscribeTopic);
                Messages = $"Subscription to topic {SubscribeTopic} was {(success ? "successful" : "unsuccessful")}{Environment.NewLine}{Messages}";
                OnPropertyChanged(nameof(Messages));

            });

            UnsubscribeCommand = new DelegateCommand(() =>
            {
                bool success = communicator.Unsubscribe(UnsubscribeTopic);
                Messages = $"Unsubscription to topic {UnsubscribeTopic} was {(success ? "successful" : "unsuccessful")}{Environment.NewLine}{Messages}";
            });
        }

        public event PropertyChangedEventHandler PropertyChanged;
        public string Topic { get; set; }
        public string Content { get; set; }
        public ICommand PublishMessage { get; set; }
        public ICommand SubscribeCommand { get; set; }
        public ICommand UnsubscribeCommand { get; set; }
        public string SubscribeTopic { get; set; }
        public string UnsubscribeTopic { get; set; }
        public string LogMessages { get; set; }
        public string Messages { get; set; }

        protected void OnPropertyChanged([CallerMemberName] string name = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }

    }
}
