import React, { useRef, useEffect } from 'react';
import { LocalTrack, RemoteTrack } from 'twilio-video';
import { UserCircle, MicOff, VideoOff } from 'lucide-react';

interface ParticipantVideoProps {
  tracks: (LocalTrack | RemoteTrack)[];
  identity: string;
  isAudioMuted?: boolean;
  isVideoMuted?: boolean;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  tracks,
  identity,
  isAudioMuted = false,
  isVideoMuted = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    tracks.forEach(track => {
      if (track.kind === 'video' && videoRef.current) {
        track.attach(videoRef.current);
      }
      if (track.kind === 'audio' && audioRef.current) {
        track.attach(audioRef.current);
      }
    });

    return () => {
      tracks.forEach(track => track.detach());
    };
  }, [tracks]);

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" />
      <audio ref={audioRef} />
      
      {isVideoMuted && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <UserCircle className="w-20 h-20 text-gray-400" />
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 flex gap-2">
        <div className="text-white font-medium px-3 py-1 bg-black/50 rounded-lg">
          {identity}
        </div>
        {isAudioMuted && (
          <div className="p-2 bg-red-500/90 rounded-lg">
            <MicOff className="w-4 h-4 text-white" />
          </div>
        )}
        {isVideoMuted && (
          <div className="p-2 bg-red-500/90 rounded-lg">
            <VideoOff className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantVideo;