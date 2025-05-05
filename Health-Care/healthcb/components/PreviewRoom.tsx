import React, { useEffect, useRef, useState } from 'react';
import { createLocalVideoTrack, LocalVideoTrack } from 'twilio-video';
import { Button } from '@/components/ui/button';
import { VideoOff, Video } from 'lucide-react';

interface PreviewRoomProps {
  onJoin: () => void;
}

const PreviewRoom = ({ onJoin }: PreviewRoomProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<LocalVideoTrack | null>(null); // Store track in ref
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const cleanup = () => {
    if (trackRef.current) {
      trackRef.current.detach().forEach((element: HTMLElement) => element.remove());
      trackRef.current.stop();
      trackRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.innerHTML = '';
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeVideo() {
      try {
        const videoTrack = await createLocalVideoTrack();
        if (!mounted) {
          videoTrack.stop();
          return;
        }
        
        trackRef.current = videoTrack;
        if (videoRef.current) {
          const videoElement = videoTrack.attach();
          videoRef.current.innerHTML = '';
          videoRef.current.appendChild(videoElement);
        }
      } catch (err) {
        console.error('Failed to create video track:', err);
      }
    }

    initializeVideo();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  const toggleVideo = () => {
    if (trackRef.current) {
      if (isVideoEnabled) {
        trackRef.current.disable();
      } else {
        trackRef.current.enable();
      }
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const handleJoin = () => {
    cleanup();
    onJoin();
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold">Preview Your Video</h2>
      <div className="relative w-[640px] h-[480px] bg-gray-900 rounded-xl overflow-hidden">
        <div ref={videoRef} className="w-full h-full" />
        {!isVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <VideoOff className="w-20 h-20 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <Button
          onClick={toggleVideo}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isVideoEnabled ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          {isVideoEnabled ? 'Disable Video' : 'Enable Video'}
        </Button>
        <Button onClick={handleJoin}>Join Room</Button>
      </div>
    </div>
  );
};

export default PreviewRoom;