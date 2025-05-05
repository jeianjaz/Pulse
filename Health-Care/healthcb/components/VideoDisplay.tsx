import React from 'react';
import ParticipantVideo from './ParticipantVideo';

interface VideoDisplayProps {
  localTracks: any[];
  participantTracks: Map<string, any[]>;
  participantMediaState: Map<string, { isAudioMuted: boolean; isVideoMuted: boolean; }>;
  isLocalAudioMuted: boolean;
  isLocalVideoMuted: boolean;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({
  localTracks,
  participantTracks,
  participantMediaState,
  isLocalAudioMuted,
  isLocalVideoMuted,
}) => {
  return (
    <div className="grid md:grid-cols-2 grid-cols-1 gap-6 h-full">
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-inner relative">
        {localTracks.length > 0 && (
          <ParticipantVideo
            key="local"
            tracks={localTracks}
            identity="You"
            isAudioMuted={isLocalAudioMuted}
            isVideoMuted={isLocalVideoMuted}
          />
        )}
      </div>
      {Array.from(participantTracks.entries()).map(([participantId, tracks]) => {
        const mediaState = participantMediaState.get(participantId) || {
          isAudioMuted: false,
          isVideoMuted: false,
        };
        
        return (
          <div key={participantId} className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-inner relative">
            <ParticipantVideo
              tracks={tracks}
              identity={participantId}
              isAudioMuted={mediaState.isAudioMuted}
              isVideoMuted={mediaState.isVideoMuted}
            />
          </div>
        );
      })}
    </div>
  );
};

export default VideoDisplay;