import React, { useState, useEffect } from 'react';
import useVideo from '@/hooks/useVideo';
import VideoControls from './VideoControls';
import VideoDisplay from './VideoDisplay';
import ChatPanel from './ChatPanel';
import NoteTaking from './NoteTaking';
import { ChatBubbleLeftRightIcon, ChatBubbleOvalLeftEllipsisIcon, ClipboardIcon, UserIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
    <span className="text-gray-600">Connecting to video...</span>
  </div>
);

interface VideoRoomProps {
  roomId: string;
  userType?: 'patient' | 'doctor' | 'admin';
  onEndCall?: () => void;
}

interface ConsultationData {
  consultation: {
    id: number;
    patient: {
      first_name: string;
      last_name: string;
    };
    request: {
      reason: string;
      symptoms: Record<string, boolean | string>;
      additional_notes: string;
    };
    health_prediction: {
      predicted_disease: string;
      significant_probabilities: Record<string, number>;
    };
  };
  record: {
    id: number;
    consultation_notes: string;
  };
}

const VideoRoom: React.FC<VideoRoomProps> = ({ roomId, userType = 'patient', onEndCall }) => {
  const [identity, setIdentity] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const { 
    room,
    error,
    participants,
    participantTracks,
    localTracks,
    connect,
    isAudioMuted,
    isVideoMuted,
    toggleAudio,
    toggleVideo,
    participantMediaState,
  } = useVideo({ roomName: roomId, identity });

  useEffect(() => {
    const storedFirstName = localStorage.getItem('first_name');
    const storedLastName = localStorage.getItem('last_name');
    
    const fullName = storedFirstName && storedLastName 
      ? `${storedFirstName} ${storedLastName}` 
      : storedFirstName || 'DefaultUser';
    
    setIdentity(fullName);
  }, [userType]);

  const handleConnect = async () => {
    if (!roomId || !identity) return;
    setIsConnecting(true);
    try {
      await connect();
    } finally {
      setIsConnecting(false);
    }
  };

  const cleanupTracks = () => {
    if (room?.localParticipant) {
      room.localParticipant.tracks.forEach(publication => {
        if (publication.track) {
          publication.track.stop();
          publication.unpublish();
          const attachedElements = publication.track.detach();
          attachedElements.forEach(element => element.remove());
        }
      });
    }

    if (localTracks) {
      localTracks.forEach(track => {
        track.stop();
        const attachedElements = track.detach();
        attachedElements.forEach(element => element.remove());
      });
    }
  };

  const handleDisconnect = () => {
    setShowConfirmation(true);
  };

  const confirmDisconnect = () => {
    cleanupTracks();
    if (room) {
      room.disconnect();
    }
    onEndCall?.();
  };

  const togglePatientDetails = async () => {
    // Simply toggle the visibility state, no need to fetch again
    setShowPatientDetails(prev => !prev);
  };

  const fetchConsultationData = async () => {
    if (!roomId) return;
    
    setIsLoadingData(true);
    try {
      const response = await axios.get('/api/consultation-record/get_room_record/', {
        params: { room: roomId },
      });
      
      setConsultationData(response.data.data.data);
    } catch (error) {
      console.error('Error fetching consultation data');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch consultation data when the component mounts and we have a roomId
  useEffect(() => {
    if (roomId && (userType === 'doctor' || userType === 'admin')) {
      fetchConsultationData();
    }
  }, [roomId, userType]);

  useEffect(() => {
    if (identity) {
      handleConnect();
    }
  }, [identity]);

  useEffect(() => {
    return () => {
      cleanupTracks();
      if (room) {
        room.disconnect();
      }
    };
  }, [room, localTracks]);

  const toggleChat = () => {
    setIsChatVisible(prev => {
      if (!prev) {
        setIsNotesVisible(false);
        setShowPatientDetails(false);
      }
      return !prev;
    });
  };

  const toggleNotes = () => {
    setIsNotesVisible(prev => {
      if (!prev) {
        setIsChatVisible(false);
        setShowPatientDetails(false);
      }
      return !prev;
    });
  };

  // Remove the chat room prefix to make it consistent with what the server expects
  const chatRoomSid = roomId;  // No longer adding the 'consultation_' prefix

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 flex lg:flex-row gap-4 p-6 overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 flex flex-col space-y-4 min-w-0">
          <div className="flex-1 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Video Consultation</h2>
            <div className="h-[calc(100%-2rem)]">
              {isConnecting && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <LoadingSpinner />
                </div>
              )}
              <VideoDisplay
                localTracks={localTracks}
                participantTracks={participantTracks}
                participantMediaState={participantMediaState}
                isLocalAudioMuted={isAudioMuted}
                isLocalVideoMuted={isVideoMuted}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div className="w-[100px] flex">
                {(userType === 'doctor' || userType === 'admin') && (
                  <button
                    onClick={togglePatientDetails}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    title={showPatientDetails ? "Hide Patient Details" : "Show Patient Details"}
                  >
                    <UserIcon className="h-6 w-6 text-gray-600" />
                  </button>
                )}
              </div>

              {/* Center controls */}
              <div className="flex-1 flex justify-center">
                <VideoControls
                  room={room}
                  isAudioMuted={isAudioMuted}
                  isVideoMuted={isVideoMuted}
                  participants={participants}
                  error={error}
                  handleConnect={handleConnect}
                  handleDisconnect={handleDisconnect}
                  handleMuteAudio={toggleAudio}
                  handleMuteVideo={toggleVideo}
                  isLoading={isConnecting}
                />
              </div>
              
              {/* Right side buttons */}
              <div className="flex gap-2">
                {userType === 'admin' && (
                  <button
                    onClick={toggleNotes}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    title={isNotesVisible ? "Hide Notes" : "Show Notes"}
                  >
                    <ClipboardIcon className="h-6 w-6 text-gray-600" />
                  </button>
                )}
                <button
                  onClick={toggleChat}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title={isChatVisible ? "Hide Chat" : "Show Chat"}
                >
                  {isChatVisible ? (
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-600" />
                  ) : (
                    <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side panels container */}
        <div className="flex gap-4 transition-all duration-300 ease-in-out overflow-hidden">
          {/* Patient Details panel */}
          {(userType === 'doctor' || userType === 'admin') && (
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                showPatientDetails ? 'w-96 opacity-100' : 'w-0 opacity-0'
              }`}
            >
              <div className="w-96 bg-white rounded-xl shadow-md h-full overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4">Patient Details</h3>
                  
                  {isLoadingData ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                  ) : consultationData ? (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-700">Patient</h4>
                        <p className="text-gray-900">
                          {consultationData.consultation.patient.first_name} {consultationData.consultation.patient.last_name}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700">Reason for Visit</h4>
                        <p className="text-gray-900">{consultationData.consultation.request.reason}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-700">Symptoms</h4>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          {Object.entries(consultationData.consultation.request.symptoms || {}).map(([symptom, value]) => (
                            <div key={symptom} className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                              <span className="text-sm">
                                {symptom}: {typeof value === 'string' ? value : (value ? 'Yes' : 'No')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {consultationData.consultation.request.additional_notes && (
                        <div>
                          <h4 className="font-medium text-gray-700">Additional Notes</h4>
                          <p className="text-gray-900 whitespace-pre-line">{consultationData.consultation.request.additional_notes}</p>
                        </div>
                      )}
                      
                      {consultationData.consultation.health_prediction && (
                        <div>
                          <h4 className="font-medium text-gray-700">Health Prediction</h4>
                          <p className="text-gray-900 font-semibold">{consultationData.consultation.health_prediction.predicted_disease}</p>
                          
                          <h5 className="font-medium text-gray-700 mt-2 text-sm">Probabilities</h5>
                          <div className="space-y-1 mt-1">
                            {Object.entries(consultationData.consultation.health_prediction.significant_probabilities || {})
                              .map(([disease, probability]) => (
                                <div key={disease} className="flex justify-between items-center">
                                  <span className="text-sm">{disease}</span>
                                  <div className="flex items-center">
                                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{width: `${probability * 100}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-xs">{(probability * 100).toFixed(0)}%</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No patient data available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {userType === 'admin' && (
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isNotesVisible ? 'w-96 opacity-100' : 'w-0 opacity-0'
              }`}
            >
              <div className="w-96 bg-white rounded-xl shadow-md h-full">
                {/* Only render NoteTaking when consultationData is available */}
                {isLoadingData ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                ) : (
                  <NoteTaking 
                    recordId={roomId} 
                    initialNotes={consultationData?.record?.consultation_notes || undefined}
                  />
                )}
              </div>
            </div>
          )}

          <div 
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isChatVisible ? 'w-96 opacity-100' : 'w-0 opacity-0'
            }`}
          >
            <div className="w-96 bg-white rounded-xl shadow-md h-full">
              <ChatPanel
                roomId={chatRoomSid}
                identity={identity}
                userType={userType === 'admin' ? 'doctor' : userType} // Map admin to doctor
              />
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">End Consultation?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to end this consultation?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisconnect}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                End Consultation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoRoom;