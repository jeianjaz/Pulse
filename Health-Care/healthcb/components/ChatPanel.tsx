import React, { useState, useEffect } from 'react';
import useConversations from '@/hooks/useConversation';

interface ChatPanelProps {
  roomId: string;
  identity: string;
  userType?: 'patient' | 'doctor' | 'admin';
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  roomId = '',
  identity = '',
  userType = 'patient'
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});

  const validRoomId = roomId?.trim() || '';
  const validIdentity = identity?.trim() || '';

  // Map admin to doctor for the backend identity
  const backendUserType = userType === 'admin' ? 'doctor' : userType;
  
  // Format the backend identity for checking message authorship
  const backendIdentity = `${backendUserType}_${validRoomId}`;
  
  // Add your real name to the display names map
  useEffect(() => {
    if (validIdentity) {
      setDisplayNames(prev => ({
        ...prev,
        [backendIdentity]: validIdentity
      }));
    }
  }, [validIdentity, backendIdentity]);

  const {
    activeConversation,
    error,
    isLoading,
    isReady,
    participants
  } = useConversations({
    identity: validIdentity,
    userType: backendUserType, // Use the mapped user type
    roomSid: validRoomId,
    displayName: validIdentity // Pass the real name for display
  });

  // Add participant display names from the conversation
  useEffect(() => {
    if (participants) {
      const newDisplayNames: Record<string, string> = {};
      
      if (participants.patient) {
        // If the backend sends full names but stores IDs in the format patient_123
        newDisplayNames[`patient_${validRoomId}`] = participants.patient;
      }
      
      if (participants.doctor) {
        newDisplayNames[`doctor_${validRoomId}`] = participants.doctor;
      }
      
      setDisplayNames(prev => ({...prev, ...newDisplayNames}));
    }
  }, [participants, validRoomId]);

  useEffect(() => {
    if (!activeConversation) return;

    const handleMessageAdded = (message: any) => {
      setMessages(prev => [...prev, {
        body: message.body,
        author: message.author,
        timestamp: message.dateCreated
      }]);
    };

    const handleError = (error: any) => {
      console.error('Conversation error');
    };

    activeConversation.on('messageAdded', handleMessageAdded);
    activeConversation.on('error', handleError);

    const loadMessages = async () => {
      try {
        const messagePaginator = await activeConversation.getMessages();
        setMessages(messagePaginator.items.map(message => ({
          body: message.body,
          author: message.author,
          timestamp: message.dateCreated
        })));
      } catch (err) {
        console.error('Failed to load messages');
      }
    };

    loadMessages();

    return () => {
      activeConversation.off('messageAdded', handleMessageAdded);
      activeConversation.off('error', handleError);
    };
  }, [activeConversation]);

  // Function to get display name for an author
  const getDisplayName = (author: string) => {
    return displayNames[author] || author;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      await activeConversation.sendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message');
    }
  };

  // Render loading state
  if (isLoading || !isReady) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-gray-500">
        Loading chat...
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-red-500">
        {error.message}
      </div>
    );
  }

  // Render missing information state
  if (!validRoomId || !validIdentity) {
    return (
      <div className="flex items-center justify-center h-full p-6 text-gray-500">
        Missing room or identity information
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b bg-[#ABF600]">
        <h3 className="text-lg font-semibold text-[#1A202C]">Chat</h3>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.author === backendIdentity ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.author === backendIdentity
                  ? 'bg-[#ABF600] text-[#1A202C]'
                  : 'bg-white border border-[#ABF600]/20 text-[#1A202C]'
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                message.author === backendIdentity
                  ? 'text-[#1A202C]/80'
                  : 'text-[#1A202C]/80'
              }`}>
                {message.author === backendIdentity ? 'You' : getDisplayName(message.author)}
              </div>
              <div>{message.body}</div>
              <div className={`text-xs mt-1 ${
                message.author === backendIdentity
                  ? 'text-[#1A202C]/60'
                  : 'text-[#1A202C]/60'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-[#ABF600]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-[#ABF600] text-[#1A202C] rounded-lg hover:bg-[#9DE100] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;