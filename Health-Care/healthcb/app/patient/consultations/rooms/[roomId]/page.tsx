"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import VideoRoom from "@/components/VideoRoom";
import PreviewRoom from "@/components/PreviewRoom";

const PatientRoomPage = () => {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [isInPreview, setIsInPreview] = useState(true);

  const handleEndCall = () => {
    router.push('/patient/consultations');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Room: {roomId}</h2>
      {isInPreview ? (
        <PreviewRoom onJoin={() => setIsInPreview(false)} />
      ) : (
        <VideoRoom 
          roomId={roomId} 
          userType="patient" 
          onEndCall={handleEndCall}
        />
      )}
    </div>
  );
};

export default PatientRoomPage;
