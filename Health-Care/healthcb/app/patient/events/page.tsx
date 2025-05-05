"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, Users, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '@/utils/axios';
import BackgroundElements from "@/components/BackgroundElements";
import EventRegistrationModal, { EventRegistrationFormData } from '@/components/Modals/EventRegistrationModal';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: string;
  description: string;
  image: string | null;
  attendees: number;
  registration_status?: string;
}

function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [processingEventId, setProcessingEventId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'register' | 'unregister' | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`/api/announcement/`);
      const data = response.data;
      const eventsData = data.data.map((item: any) => ({
        id: parseInt(item.id),
        title: item.attributes.title,
        date: item.attributes.date,
        time: item.attributes.time,
        location: item.attributes.location,
        status: item.attributes.status,
        description: item.attributes.description,
        image: item.attributes.image,
        attendees: item.attributes.attendees || 0
      }));
      setEvents(eventsData.filter((event: Event) => event.status !== 'Deleted'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const response = await api.get(`/patient/registered-events/`);
      const events = response.data || [];
      if (Array.isArray(events)) {
        setRegisteredEvents(events.map((event: any) => 
          parseInt(event.id)
        ));
      } else {
        setRegisteredEvents([]);
      }
    } catch (error) {
      console.error('Error fetching registered events:', error);
      setRegisteredEvents([]);
    }
  };

  const initiateRegister = (event: Event) => {
    setSelectedEventForRegistration(event);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSubmit = async (formData: EventRegistrationFormData) => {
    if (!selectedEventForRegistration) return;
    
    setProcessingEventId(selectedEventForRegistration.id);
    setShowRegistrationModal(false);
    
    try {
      const response = await axios.post(
        `/api/patient/event-registration/${selectedEventForRegistration.id}/`,
        {
          additional_info: formData.notes ? { notes: formData.notes } : null
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      setRegisteredEvents([...registeredEvents, selectedEventForRegistration.id]);
      showNotificationMessage('Successfully registered for the event!');
      fetchEvents();
    } catch (error: any) {
      console.error('Error registering for event:', error);
      const errorMessage = error.response?.data?.message || 'Failed to register for the event. Please try again.';
      showNotificationMessage(errorMessage);
    } finally {
      setProcessingEventId(null);
      setSelectedEventForRegistration(null);
    }
  };

  const initiateUnregister = (eventId: number) => {
    setProcessingEventId(eventId);
    setConfirmAction('unregister');
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!processingEventId) return;

    try {
      if (confirmAction === 'unregister') {
        await handleUnregister(processingEventId);
      }
    } finally {
      setShowConfirmDialog(false);
      setProcessingEventId(null);
      setConfirmAction(null);
    }
  };

  const handleCancelAction = () => {
    setShowConfirmDialog(false);
    setProcessingEventId(null);
    setConfirmAction(null);
  };

  const handleUnregister = async (eventId: number) => {
    try {
      await axios.delete(`/api/patient/event-registration/${eventId}/`);
      
      setRegisteredEvents(registeredEvents.filter(id => id !== eventId));
      showNotificationMessage('Successfully unregistered from the event.');
      fetchEvents();
    } catch (error) {
      console.error('Error unregistering from event:', error);
      showNotificationMessage('Failed to unregister from the event. Please try again.');
    }
  };

  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <BackgroundElements />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/patient')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-[#1A202C]">Medical Events</h1>
          </div>
        </div>

        {/* Notification */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 bg-[#ABF600] text-[#1A202C] px-6 py-3 rounded-lg shadow-lg"
            >
              {notificationMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Dialog */}
        <AnimatePresence>
          {showConfirmDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
              >
                <h3 className="text-xl font-bold text-[#1A202C] mb-4">
                  {confirmAction === 'unregister' ? 'Unregister from Event' : ''}
                </h3>
                <p className="text-gray-600 mb-6">
                  {confirmAction === 'unregister'
                    ? 'Are you sure you want to unregister from this event?'
                    : ''}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleConfirmAction}
                    className={`flex-1 py-2 rounded-lg ${
                      confirmAction === 'unregister'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : ''
                    } transition-colors`}
                  >
                    {processingEventId === null ? (
                      confirmAction === 'unregister' ? 'Unregister' : ''
                    ) : (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-current rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    )}
                  </button>
                  <button
                    onClick={handleCancelAction}
                    className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Modal */}
        <EventRegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => {
            setShowRegistrationModal(false);
            setSelectedEventForRegistration(null);
          }}
          onSubmit={handleRegistrationSubmit}
          eventTitle={selectedEventForRegistration?.title || ''}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 animate-pulse"
              >
                {/* Skeleton Image */}
                <div className="relative h-56 w-full bg-gray-200" />

                {/* Skeleton Content */}
                <div className="p-6">
                  {/* Status Badge Skeleton */}
                  <div className="absolute top-4 right-4">
                    <div className="w-24 h-6 bg-gray-200 rounded-full" />
                  </div>

                  {/* Title Skeleton */}
                  <div className="h-7 bg-gray-200 rounded-lg mb-3 w-3/4" />
                  
                  {/* Description Skeleton */}
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                  </div>

                  {/* Details Section Skeleton */}
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    {/* Date Skeleton */}
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="ml-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                      </div>
                    </div>

                    {/* Time Skeleton */}
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="ml-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-32" />
                      </div>
                    </div>

                    {/* Location Skeleton */}
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="ml-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-40" />
                      </div>
                    </div>

                    {/* Attendees Skeleton */}
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="ml-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-20" />
                      </div>
                    </div>
                  </div>

                  {/* Action Button Skeleton */}
                  <div className="flex justify-end mt-6">
                    <div className="w-32 h-9 bg-gray-200 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Bell className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No events available</h3>
            <p className="text-gray-500 text-center max-w-md mb-8">
              There are currently no medical events scheduled. Check back later for upcoming health workshops, screenings, and other events.
            </p>
            <button 
              onClick={() => router.push('/patient')}
              className="bg-[#ABF600] text-[#1A202C] px-6 py-2 rounded-lg hover:bg-[#9DE100] transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {event.image && (
                  <div className="relative h-48 w-full">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-[#1A202C]">{event.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-5 h-5 mr-2" />
                      <span>{event.attendees} Attendees</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 whitespace-pre-wrap">{event.description}</p>

                  {registeredEvents.includes(event.id) ? (
                    <button
                      onClick={() => initiateUnregister(event.id)}
                      disabled={processingEventId === event.id}
                      className={`w-full bg-red-500 text-white py-2 rounded-lg transition-colors ${
                        processingEventId === event.id
                          ? 'opacity-75 cursor-not-allowed'
                          : 'hover:bg-red-600'
                      }`}
                    >
                      {processingEventId === event.id ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-t-2 border-current rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Unregister'
                      )}
                    </button>
                  ) : (
                    <div>
                      {event.status.toLowerCase() === 'upcoming' || 
                       event.status.toLowerCase() === 'cancelled' || 
                       event.registration_status === 'registered' ? (
                        <button
                          disabled
                          className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed"
                        >
                          {event.registration_status === 'registered' 
                            ? 'Already Registered'
                            : event.status.toLowerCase() === 'upcoming' 
                              ? 'Not Yet Open' 
                              : 'Registration Closed'}
                        </button>
                      ) : (
                        <button
                          onClick={() => initiateRegister(event)}
                          disabled={processingEventId === event.id}
                          className={`w-full bg-[#ABF600] text-[#1A202C] py-2 rounded-lg transition-colors ${
                            processingEventId === event.id
                              ? 'opacity-75 cursor-not-allowed'
                              : 'hover:bg-[#9DE100]'
                          }`}
                        >
                          {processingEventId === event.id ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-t-2 border-current rounded-full animate-spin mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            'Register'
                          )}
                        </button>
                      )}
                    </div>
                  )}

                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default (EventsPage);
