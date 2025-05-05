import React, { useState, useEffect } from 'react';
import { useConversations } from '@/hooks/useConversation';

interface ChatProps {
  roomId: string;
  identity: string;
  userType: 'patient' | 'admin';
}

export const Chat: React.FC<ChatProps> = ({ roomId, identity, userType }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const {
    activeConversation,
    error,
    isLoading,
    isReady,
    joinConversation
  } = useConversations({
    identity,
    userType
  });

  useEffect(() => {
    if (isReady && roomId) {
      joinConversation(roomId).catch(error => {
        console.error('Failed to join conversation:', error);
      });
    }
  }, [isReady, roomId, joinConversation]);

  useEffect(() => {
    if (activeConversation) {
      const handleMessageAdded = (message: any) => {
        setMessages(prev => [...prev, {
          body: message.body,
          author: message.author,
          timestamp: message.dateCreated
        }]);
      };

      activeConversation.on('messageAdded', handleMessageAdded);

      activeConversation.getMessages().then((messagePaginator) => {
        setMessages(messagePaginator.items.map(message => ({
          body: message.body,
          author: message.author,
          timestamp: message.dateCreated
        })));
      });

      return () => {
        activeConversation.off('messageAdded', handleMessageAdded);
      };
    }
  }, [activeConversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation || !newMessage.trim()) return;

    try {
      await activeConversation.sendMessage(newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <p className="text-red-500">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!activeConversation) {
    return <div>Initializing chat...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.author === identity ? 'text-right' : ''}`}>
            <span className="text-xs text-gray-500">{msg.author}</span>
            <div className={`p-2 rounded-lg inline-block max-w-[80%] ${
              msg.author === identity 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200'
            }`}>
              {msg.body}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 border rounded px-2 py-1"
            placeholder="Type a message..."
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-1 rounded"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};