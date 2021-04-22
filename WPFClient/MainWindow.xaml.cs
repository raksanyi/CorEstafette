using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace WPFClient
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        Communicator communicator = new Communicator();
        public MainWindow()
        {
            InitializeComponent();
        }

        public void PublishMessage(object sender, RoutedEventArgs e)
        {
            if (ContentText.Text != "")
            {
                LogMessages.Text = ContentText.Text + '\n' + LogMessages.Text;
                ContentText.Text = "";
            }
        }

        public void SubscribeTopic(object sender, RoutedEventArgs e)
        {
            if (SubscribeText.Text != "")
            {
                if (communicator.Subscribe(SubscribeText.Text))
                    Messages.Text = "Subscription for topic " + SubscribeText.Text + " was successful.\n" + Messages.Text;
                else
                    Messages.Text = "Subscription for topic " + SubscribeText.Text + " has failed.\n" + Messages.Text;
                SubscribeText.Text = "";
            }
               
            
        }

        public void UnsubscribeTopic(object sender, RoutedEventArgs e)
        {
            if(UnsubscribeText.Text != "")
            {
                if (communicator.Unsubscribe(UnsubscribeText.Text))
                    Messages.Text = "Unsubscribtion for topic " + UnsubscribeText.Text + " was successful.\n" + Messages.Text;
                else
                    Messages.Text = "Unsubscription for topic " + UnsubscribeText.Text + " has failed.\n" + Messages.Text;
                UnsubscribeText.Text = "";
            }
        }
    }
}
