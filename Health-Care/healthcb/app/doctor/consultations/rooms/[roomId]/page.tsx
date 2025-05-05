'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoRoom from '@/components/VideoRoom';
import PreviewRoom from '@/components/PreviewRoom';

const AdminRoomPage = () => {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [isInPreview, setIsInPreview] = useState(true);
  
  const handleEndCall = () => {
    router.push(`/doctor/consultations/rooms/${roomId}/post-consultation`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Room: {roomId}</h2>
      {isInPreview ? (
        <PreviewRoom onJoin={() => setIsInPreview(false)} />
      ) : (
        <VideoRoom
          roomId={roomId} 
          userType="admin" 
          onEndCall={handleEndCall}
        />
      )}
    </div>
  );
};

export default AdminRoomPage;