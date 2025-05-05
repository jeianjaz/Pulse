import { Client, Conversation } from '@twilio/conversations';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { getCsrfToken } from '@/utils/csrf';

interface ConversationError {
  message: string;
  code?: number;
  originalError?: Error;
}

const useConversations = ({
  identity = '',
  userType = 'patient',
  roomSid = '',
  displayName = ''
}: {
  identity: string;
  userType: 'patient' | 'admin' | 'doctor';
  roomSid?: string;
  displayName?: string;
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<ConversationError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [participants, setParticipants] = useState<{
    patient?: string;
    doctor?: string;
  }>({});

  // Normalize the room SID to handle different naming conventions
  const normalizeRoomSid = useCallback((sid: string) => {
    return sid.replace('consultation_', '');
  }, []);

  // Generate the identity in the format the backend expects
  const getFormattedIdentity = useCallback((identity: string, userType: string, roomId: string) => {
    // If the identity is already in the expected format (e.g. patient_123), use it as is
    if (identity.startsWith('patient_') || identity.startsWith('doctor_')) {
      return identity;
    }
    
    // Otherwise, format it as expected by the backend
    const baseRoomId = normalizeRoomSid(roomId);
    
    // Map 'admin' to 'doctor' for conversation identity purposes
    const mappedType = userType.toLowerCase() === 'admin' ? 'doctor' : userType.toLowerCase();
    
    return `${mappedType}_${baseRoomId}`;
  }, [normalizeRoomSid]);

  // Initialize the Twilio client
  useEffect(() => {
    const initClient = async () => {
      if (!identity?.trim() || !roomSid?.trim()) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const normalizedRoomSid = normalizeRoomSid(roomSid);
        const formattedIdentity = getFormattedIdentity(identity, userType, normalizedRoomSid);
        
        // Get token from server with auto_create=true
        const response = await axios.post('/api/conversation/token', {
          identity: formattedIdentity,
          userType,
          room: normalizedRoomSid,
          displayName: displayName || identity,
          auto_create: true
        }, {
          headers: { 'X-CSRFToken': getCsrfToken() },
          withCredentials: true,
        });
        
        // Handle different response structures
        const token = response.data?.data?.data?.data?.token || 
                      response.data?.data?.data?.token || 
                      response.data?.data?.token;
        
        if (!token) {
          throw new Error('Failed to get token');
        }

        // Store participants information
        const participantsData = response.data?.data?.data?.participants || 
                               response.data?.data?.data?.data?.participants ||
                               response.data?.data?.participants;
        if (participantsData) {
          setParticipants(participantsData);
        }

        // Create client with token
        const newClient = new Client(token);
        
        // Set up event listeners
        newClient.on('connectionStateChanged', (state) => {
          if (state === 'connected') setIsLoading(false);
          if (state === 'failed') setError({ message: 'Connection failed' });
        });

        newClient.on('tokenAboutToExpire', async () => {
          try {
            const refreshResponse = await axios.post('/api/conversation/token', {
              identity,
              userType,
              room: normalizedRoomSid
            }, {
              headers: { 'X-CSRFToken': getCsrfToken() },
              withCredentials: true,
            });
            
            const newToken = refreshResponse.data?.data?.data?.data?.token || 
                          refreshResponse.data?.data?.data?.token || 
                          refreshResponse.data?.data?.token;
                          
            if (newToken) {
              await newClient.updateToken(newToken);
            }
          } catch (err) {
            console.error('Failed to refresh token');
          }
        });

        setClient(newClient);
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize client');
        setError({ 
          message: err instanceof Error ? err.message : String(err) || 'Unknown error',
          originalError: err instanceof Error ? err : undefined
        });
        setIsLoading(false);
      }
    };

    initClient();

    return () => {
      if (client) {
        client.removeAllListeners();
      }
    };
  }, [identity, userType, roomSid, normalizeRoomSid, displayName, getFormattedIdentity]);

  // Try to get conversation with different naming conventions
  const findConversation = useCallback(async (client: Client, roomId: string): Promise<Conversation | null> => {
    // Extract the base ID without prefixes
    const baseId = roomId.replace('consultation_', '');
    
    const possibleNames = [
      roomId,                   
      `consultation_${baseId}`,  
      baseId,                    
      `Room ${baseId}`,          
      `Chat Room ${baseId}`      
    ];
    
    // First try to list all conversations
    try {
      const conversations = await client.getSubscribedConversations();
      
      // Try to find a conversation by friendlyName
      const matchByFriendlyName = conversations.items.find(conv => {
        const fn = conv.friendlyName || '';
        return fn.includes(baseId) || 
               fn.includes(roomId) ||
               fn === `Room ${baseId}` ||
               fn === `Chat Room ${baseId}`;
      });
      
      if (matchByFriendlyName) {
        return matchByFriendlyName;
      }
    } catch (listErr) {
      // Continue with other methods if this fails
    }
    
    // Try each of the possible names
    for (const name of possibleNames) {
      try {
        // Try by uniqueName
        const conversation = await client.getConversationByUniqueName(name);
        return conversation;
      } catch (err) {
        // Try by SID if uniqueName fails
        try {
          const conversation = await client.getConversationBySid(name);
          return conversation;
        } catch (innerErr) {
          // Continue to next name
        }
      }
    }
    
    return null;
  }, []);

  // Request a new conversation creation through the token API with auto_create=true
  const requestConversationCreation = useCallback(async (roomId: string) => {
    const normalizedRoomSid = normalizeRoomSid(roomId);
    const formattedIdentity = getFormattedIdentity(identity, userType, normalizedRoomSid);
    
    try {
      // Instead of using a separate create endpoint, we're using the token endpoint with auto_create=true
      const response = await axios.post('/api/conversation/token', {
        identity: formattedIdentity,
        userType,
        room: normalizedRoomSid,
        displayName: displayName || identity,
        auto_create: true
      }, {
        headers: { 'X-CSRFToken': getCsrfToken() },
        withCredentials: true,
      });
      
      return response.data;
    } catch (err) {
      console.error('Failed to request conversation creation');
      throw err;
    }
  }, [normalizeRoomSid, identity, userType, displayName, getFormattedIdentity]);

  // Join the conversation once client is ready
  useEffect(() => {
    const joinExistingConversation = async () => {
      if (!client || !roomSid || !isReady) return;
      
      try {
        setIsLoading(true);
        
        const conversation = await findConversation(client, roomSid);
        
        if (conversation) {
          // Try to join if not already a participant
          try {
            await conversation.join();
          } catch (joinErr: any) {
            // If error is because we're already a participant, that's fine
            if (joinErr.code !== 50433) {
              // Not already a participant error
              console.warn('Join warning:', joinErr.message);
            }
          }
          
          setActiveConversation(conversation);
        } else {
          // If conversation doesn't exist, request creation via token endpoint with auto_create=true
          try {
            await requestConversationCreation(roomSid);
            
            // Wait a moment for the conversation to be fully created
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try to get the newly created conversation
            const newConversation = await findConversation(client, roomSid);
            
            if (newConversation) {
              setActiveConversation(newConversation);
            } else {
              throw new Error('Conversation creation was requested but could not be found');
            }
          } catch (createErr) {
            console.error('Failed to create conversation');
            setError({ 
              message: 'Could not create conversation',
              originalError: createErr instanceof Error ? createErr : undefined 
            });
          }
        }
      } catch (err) {
        console.error('Error joining conversation');
        setError({ 
          message: 'Could not join conversation',
          originalError: err instanceof Error ? err : undefined 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    joinExistingConversation();
  }, [client, roomSid, isReady, findConversation, requestConversationCreation]);

  // Function to explicitly join a conversation
  const joinConversation = useCallback(async (conversationSid: string) => {
    if (!client) {
      throw new Error('Client not initialized');
    }

    setIsLoading(true);
    try {
      const conversation = await findConversation(client, conversationSid);
      
      if (conversation) {
        // Try to join if not already a participant
        try {
          await conversation.join();
        } catch (joinErr: any) {
          // If error is because we're already a participant, that's fine
          if (joinErr.code !== 50433) { // 50433 = "Already a Participant"
            console.warn('Join warning:', joinErr);
          }
        }
        
        setActiveConversation(conversation);
        return conversation;
      }
      
      // If conversation doesn't exist, request creation via token endpoint
      await requestConversationCreation(conversationSid);
      
      // Try to get the newly created conversation after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newConversation = await findConversation(client, conversationSid);
      
      if (newConversation) {
        setActiveConversation(newConversation);
        return newConversation;
      }
      
      throw new Error('Conversation not found and could not be created');
    } catch (err) {
      console.error('Failed to join conversation');
      setError({ 
        message: 'Failed to join conversation',
        originalError: err instanceof Error ? err : undefined 
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [client, findConversation, requestConversationCreation]);

  return {
    client,
    error,
    isLoading,
    isReady,
    activeConversation,
    participants,
    joinConversation
  };
};

export default useConversations;
export { useConversations };