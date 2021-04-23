using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WPFClient
{
    class Communicator
    {
        private List<String> subscriptions;
        
        public Communicator( )
        {
             subscriptions = new List<string>();
        }

        public bool Subscribe(String topic)
        {
            if (FindSubscriptionIndex(topic) < 0)
            {
                subscriptions.Add(topic);
                return true;
            }
            return false;
        }

        public bool Unsubscribe(String topic)
        {
            int indexOfTopic = FindSubscriptionIndex(topic);

            if (indexOfTopic < 0)
                return false;

            subscriptions.RemoveAt(indexOfTopic);
            return true;

        }

        public bool Publish(String topic, String message )
        {
            return message == "" ? false : true;
            
        }

        private int FindSubscriptionIndex(String topic)
        {
            return subscriptions.IndexOf(topic);
        }
    }
}
