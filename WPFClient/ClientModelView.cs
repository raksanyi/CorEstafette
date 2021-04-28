using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Prism.Commands;
using System.Threading.Tasks;
using System.Diagnostics;

namespace WPFClient
{
    class ClientModelView : INotifyPropertyChanged
    {
        private Communicator communicator = new Communicator();

        public ClientModelView() 
        {
            PublishMessage = new DelegateCommand( async () =>
            {
                await communicator.PublishAsync(Topic, Content);
            });

            SubscribeCommand = new DelegateCommand(async () =>
            {
                var response = await communicator.SubscribeAsync(SubscribeTopic, OnSubscribeAsync);
               
                if ( response == null )
                {
                    Messages = "Subscription failed." + Environment.NewLine + Messages;
                    OnPropertyChanged(nameof(Messages));
                    return;
                }
                Messages = $"Subscription to topic {SubscribeTopic} was {(response.Equals("success") ? "successful" : "unsuccessful")}{Environment.NewLine}{Messages}";
                OnPropertyChanged(nameof(Messages));

            });

            UnsubscribeCommand = new DelegateCommand(async () =>
            {
                var response = await communicator.UnsubscribeAsync(UnsubscribeTopic);
                if( response == null )
                {
                    Messages = "Unsubscription failed." + Environment.NewLine + Messages;
                    OnPropertyChanged(nameof(Messages));
                    return;
                }
                Messages = $"Unsubscription to topic {UnsubscribeTopic} was {(response.Equals("success") ? "successful" : "unsuccessful")}{Environment.NewLine}{Messages}";
                OnPropertyChanged(nameof(Messages));
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

        public Task OnSubscribeAsync(string response)
        {
            Messages = response + Environment.NewLine + Messages;
            OnPropertyChanged(nameof(Messages));

            return Task.CompletedTask;
        }
        protected void OnPropertyChanged([CallerMemberName] string name = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }

    }
}
