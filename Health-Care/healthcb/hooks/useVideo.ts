import { useState, useEffect, useCallback } from 'react';
import { connect, Room, RemoteParticipant, RemoteTrack, LocalTrack } from 'twilio-video';
import axios from 'axios';
import { getCsrfToken } from '@/utils/csrf';

interface UseVideoProps {
  roomName: string;
  identity: string;
}

interface ParticipantMediaState {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
}

const useVideo = ({ roomName, identity }: UseVideoProps) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
  const [participantTracks, setParticipantTracks] = useState<Map<string, RemoteTrack[]>>(new Map());
  const [localTracks, setLocalTracks] = useState<LocalTrack[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [participantMediaState, setParticipantMediaState] = useState<Map<string, ParticipantMediaState>>(new Map());

  const handleTrackDisabled = useCallback((participant: RemoteParticipant, track: RemoteTrack) => {
    setParticipantMediaState(prev => {
      const newMap = new Map(prev);
      const currentState = newMap.get(participant.identity) || { isAudioMuted: false, isVideoMuted: false };
      
      if (track.kind === 'audio') {
        newMap.set(participant.identity, { ...currentState, isAudioMuted: true });
      } else if (track.kind === 'video') {
        newMap.set(participant.identity, { ...currentState, isVideoMuted: true });
      }
      
      return newMap;
    });
  }, []);

  const handleTrackEnabled = useCallback((participant: RemoteParticipant, track: RemoteTrack) => {
    setParticipantMediaState(prev => {
      const newMap = new Map(prev);
      const currentState = newMap.get(participant.identity) || { isAudioMuted: false, isVideoMuted: false };
      
      if (track.kind === 'audio') {
        newMap.set(participant.identity, { ...currentState, isAudioMuted: false });
      } else if (track.kind === 'video') {
        newMap.set(participant.identity, { ...currentState, isVideoMuted: false });
      }
      
      return newMap;
    });
  }, []);

  const handleTrackSubscribed = useCallback((participant: RemoteParticipant, track: RemoteTrack) => {
    setParticipantTracks(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(participant.identity) || [];
      newMap.set(participant.identity, [...existing, track]);
      return newMap;
    });

    track.on('disabled', () => handleTrackDisabled(participant, track));
    track.on('enabled', () => handleTrackEnabled(participant, track));

    // Set initial state
    if (track.isEnabled === false) {
      handleTrackDisabled(participant, track);
    }
  }, [handleTrackDisabled, handleTrackEnabled]);

  const handleTrackUnsubscribed = useCallback((participant: RemoteParticipant, track: RemoteTrack) => {
    setParticipantTracks(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(participant.identity) || [];
      newMap.set(participant.identity, existing.filter(t => t !== track));
      return newMap;
    });
  }, []);

  const handleParticipant = useCallback((participant: RemoteParticipant) => {
    
    setParticipants(prev => new Map(prev.set(participant.identity, participant)));

    participant.tracks.forEach(publication => {
      if (publication.isSubscribed && publication.track) {
        handleTrackSubscribed(participant, publication.track);
      }
    });

    participant.on('trackSubscribed', track => handleTrackSubscribed(participant, track));
    participant.on('trackUnsubscribed', track => handleTrackUnsubscribed(participant, track));
  }, [handleTrackSubscribed, handleTrackUnsubscribed]);

  const connectToRoom = useCallback(async () => {
    if (!roomName || !identity) {
      setError('Room name and identity are required');
      return;
    }

    try {
      const response = await axios.post('/api/video/token', {
        room_name: roomName,
        user_identity: identity
      }, {
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
        withCredentials: true,
      });
      
      if (!response.data?.data?.token) {
        throw new Error('Invalid token response');
      }

      const room = await connect(response.data.data.token, { 
        name: roomName,
        audio: true,
        video: { width: 640, height: 480 }
      });

      const localTracks = Array.from(room.localParticipant.tracks.values()).map(publication => publication.track);
      setLocalTracks(localTracks);

      
      room.participants.forEach(handleParticipant);
      room.on('participantConnected', handleParticipant);
      room.on('participantDisconnected', participant => {
        setParticipants(prev => {
          const updated = new Map(prev);
          updated.delete(participant.identity);
          return updated;
        });
        setParticipantTracks(prev => {
          const updated = new Map(prev);
          updated.delete(participant.identity);
          return updated;
        });
      });

      setRoom(room);
    } catch (err) {
      console.error('Error connecting to room:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to room');
    }
  }, [roomName, identity, handleParticipant]);

  const toggleAudio = useCallback(() => {
    if (!room) return;
    
    room.localParticipant.audioTracks.forEach(publication => {
      if (publication.track) {
        if (isAudioMuted) {
          publication.track.enable();
        } else {
          publication.track.disable();
        }
      }
    });
    
    setIsAudioMuted(!isAudioMuted);
  }, [room, isAudioMuted]);

  const toggleVideo = useCallback(() => {
    if (!room) return;
    
    room.localParticipant.videoTracks.forEach(publication => {
      if (publication.track) {
        if (isVideoMuted) {
          publication.track.enable();
        } else {
          publication.track.disable();
        }
      }
    });
    
    setIsVideoMuted(!isVideoMuted);
  }, [room, isVideoMuted]);

  useEffect(() => {
    return () => {
      if (room) {
        // Handle disconnected event
        room.on('disconnected', () => {
          // Detach and cleanup local participant tracks
          room.localParticipant.tracks.forEach(publication => {
            const track = publication.track;
            if (track) {
              const attachedElements = track.detach();
              attachedElements.forEach(element => element.remove());
              // Stop the track if it has a stop method
              if ('stop' in track) {
                track.stop();
              }
            }
          });
        });

        room.participants.forEach(participant => {
          participant.removeAllListeners();
        });

        room.removeAllListeners();
        room.disconnect();

        localTracks.forEach(track => {
          const elements = track.detach();
          elements.forEach(element => element.remove());
          if ('stop' in track) {
            track.stop();
          }
        });
      }
    };
  }, [room, localTracks]);

  return { 
    room,
    error,
    participants,
    participantTracks,
    localTracks,
    connect: connectToRoom,
    isAudioMuted,
    isVideoMuted,
    toggleAudio,
    toggleVideo,
    participantMediaState,
  };
};

export default useVideo;