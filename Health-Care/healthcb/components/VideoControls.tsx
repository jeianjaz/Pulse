import React from 'react';
import { Room } from 'twilio-video';
import { MicrophoneIcon, VideoCameraIcon, PhoneIcon } from '@heroicons/react/24/solid';
import { MicrophoneIcon as MicrophoneIconOutline, VideoCameraIcon as VideoCameraIconOutline, PhoneIcon as PhoneIconOutline } from '@heroicons/react/24/outline';

interface VideoControlsProps {
  room: Room | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  participants: Map<string, any>;
  error: string | null;
  handleConnect: () => void;
  handleDisconnect: () => void;
  handleMuteAudio: () => void;
  handleMuteVideo: () => void;
  isAdmin?: boolean;
  isLoading?: boolean;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  room,
  isAudioMuted,
  isVideoMuted,
  participants,
  error,
  handleConnect,
  handleDisconnect,
  handleMuteAudio,
  handleMuteVideo,
  isAdmin,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <p className="font-medium">Room ID: <span className="text-gray-800">{room?.name || 'N/A'}</span></p>
          <p className="mt-1">
            Participants ({participants.size}):
            {Array.from(participants.keys()).map(participantId => (
              <span key={participantId} className="ml-2 text-gray-800">
                {isAdmin ? `Dr. ${participantId}` : participantId}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {!room ? (
          <button 
            onClick={handleConnect}
            className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            <PhoneIcon className="h-6 w-6" />
          </button>
        ) : (
          <>
            <button
              onClick={handleMuteAudio}
              disabled={isLoading}
              className={`p-3 rounded-full ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
              }`}
            >
              {isAudioMuted ? (
                <MicrophoneIconOutline className="h-6 w-6" />
              ) : (
                <MicrophoneIcon className="h-6 w-6" />
              )}
            </button>
            <button
              onClick={handleMuteVideo}
              disabled={isLoading}
              className={`p-3 rounded-full ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
              }`}
            >
              {isVideoMuted ? (
                <VideoCameraIconOutline className="h-6 w-6" />
              ) : (
                <VideoCameraIcon className="h-6 w-6" />
              )}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className={`flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <PhoneIcon className="h-6 w-6 text-white rotate-[135deg]" />
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm text-center mt-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoControls;