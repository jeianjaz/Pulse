const ChatRoom = ({ roomId }: { roomId: string }) => {
  const [identity] = useState(() => localStorage.getItem('identity') || '');
  const { 
    activeConversation,
    joinConversation,
    leaveConversation,
    createConversation,
    error,
    isReady 
  } = useConversations({ identity });

  useEffect(() => {
    const initializeChat = async () => {
      if (!isReady) return;
      
      try {
        await joinConversation(roomId);
      } catch (err) {
        try {
          await createConversation(roomId);
        } catch (createErr) {
          console.error('Failed to create conversation:', createErr);
        }
      }
    };

    initializeChat();
    
    return () => {
      leaveConversation();
    };
  }, [roomId, isReady]);

  // ...rest of the component
};