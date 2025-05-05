"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BackgroundElements from "@/components/BackgroundElements";
import { Calendar, MapPin, Plus, Edit, Trash2, ArrowLeft, Users, Clock, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AdminLayout from "../layout";
import axios from 'axios';
import LoadingSkeleton from './loading-skeleton';
import DefaultEventImage from '@/components/DefaultEventImage';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  status: string;
  description: string;
  image: string | File | null;
  attendees: number;
  targetAge?: string;
}

const COMMON_EVENTS = {
  'Vaccination Drive': 'A comprehensive community vaccination program providing essential immunizations to residents. Our healthcare professionals will administer vaccines, provide vaccination records, and offer guidance on immunization schedules. This event aims to increase vaccination coverage and protect our community from preventable diseases.',
  'Blood Donation Drive': 'A vital blood donation campaign supporting local healthcare facilities and emergency needs. In partnership with blood banks, we facilitate safe blood collection, provide donor health screenings, and issue donation certificates. Your contribution can help save lives in our community.',
  'Mental Health Awareness': 'Interactive educational sessions and professional consultations focused on mental health and well-being. Expert counselors will conduct workshops, provide stress management techniques, and offer confidential mental health assessments. Together, we work to destigmatize mental health and support our community\'s emotional wellness.',
  'Medical Mission': 'Free comprehensive medical services including check-ups, consultations, and basic healthcare for the community. Our team of medical professionals will provide vital sign monitoring, general health assessments, dental services, and basic medication as needed. This mission ensures healthcare access for all community members.',
  'Nutrition Programs': 'Educational and practical programs focused on promoting healthy eating habits and proper nutrition. Our nutrition experts provide dietary guidance, cooking demonstrations, and personalized meal planning advice. This program aims to improve community health through better nutrition awareness and practices.',
  'Gender Development Initiatives': 'Comprehensive programs addressing gender-specific health concerns and promoting gender equality in healthcare access. These initiatives include reproductive health education, gender-sensitive healthcare services, and support groups for gender-specific health issues.',
  'Anti-Drug Campaigns': 'Community-based drug prevention and awareness programs. These campaigns include educational workshops, counseling services, and rehabilitation support, working together with local authorities to create a drug-free community.'
};

const COMMON_LOCATIONS = [
  'Barangay Hall',
  'Covered Court',
  'Multi-purpose Hall',
  'Barangay Health Center',
  'Community Center',
  'Chapel',
  'Daycare Center'
];

const AGE_GROUPS = [
  'All barangay residents',
  'Children (0-12 years old)',
  'Youth (13-17 years old)',
  'Adults (18-59 years old)',
  'Elderly (60+ years old)',
  'Parents',
];

interface TimeSlot {
  start: string;
  end: string;
  display: string;
}

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let startHour = 5; startHour <= 15; startHour++) { // Start from 5 AM, last slot starts at 3 PM
    const endHour = startHour + 1;
    if (endHour <= 16) { // Ensure end time doesn't exceed 4 PM
      const start = `${startHour.toString().padStart(2, '0')}:00`;
      const end = `${endHour.toString().padStart(2, '0')}:00`;
      const startPeriod = startHour >= 12 ? 'PM' : 'AM';
      const endPeriod = endHour >= 12 ? 'PM' : 'AM';
      const displayStart = `${startHour > 12 ? startHour - 12 : startHour}:00 ${startPeriod}`;
      const displayEnd = `${endHour > 12 ? endHour - 12 : endHour}:00 ${endPeriod}`;
      slots.push({
        start,
        end,
        display: `${displayStart} to ${displayEnd}`
      });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const formatAMPM = (time: string | undefined) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

const MedicalEvents = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: number]: boolean }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    customTitle: '',
    date: '',
    time: '',
    customStartTime: '',
    customEndTime: '',
    location: '',
    customLocation: '',
    status: 'Scheduled',
    description: '',
    image: null as string | File | null,
    attendees: 0,
    targetAge: ''
  });
  const [deletedEvents, setDeletedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/announcement/`);
        const data = response.data;
        const eventsData = data.data.map((item: any) => ({
          id: parseInt(item.id),
          title: item.attributes.title,
          date: item.attributes.date,
          time: item.attributes.time,
          endTime: item.attributes.endTime,
          location: item.attributes.location,
          status: item.attributes.status,
          description: item.attributes.description,
          image: item.attributes.image && (item.attributes.image.startsWith('/') || item.attributes.image.startsWith('http'))
            ? item.attributes.image.replace('https://https://', 'https://')
            : null,
          attendees: item.attributes.attendees
        }));
        setEvents(eventsData.filter((event: Event) => event.status !== 'Deleted'));
        setDeletedEvents(eventsData.filter((event: Event) => event.status === 'Deleted'));
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const debouncedSubmit = useCallback((callback: () => Promise<void>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    callback().finally(() => {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 2000); // 2 second cooldown
    });
  }, [isSubmitting]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      console.log('Please wait before submitting again');
      return;
    }

    // Validate time duration
    const startHour = parseInt(newEvent.customStartTime.split(':')[0]);
    const endHour = parseInt(newEvent.customEndTime.split(':')[0]);
    const startMinutes = parseInt(newEvent.customStartTime.split(':')[1]);
    const endMinutes = parseInt(newEvent.customEndTime.split(':')[1]);

    if (startHour > endHour || (startHour === endHour && startMinutes >= endMinutes)) {
      alert('End time must be after start time');
      return;
    }

    debouncedSubmit(async () => {
      const formData = new FormData();
      formData.append('title', newEvent.title === 'Other' ? newEvent.customTitle : newEvent.title);
      formData.append('date', newEvent.date);
      formData.append('time', `${newEvent.customStartTime}-${newEvent.customEndTime}`);
      formData.append('location', newEvent.location === 'Other' ? newEvent.customLocation : newEvent.location);
      formData.append('status', newEvent.status);
      formData.append('description', newEvent.description);
      if (newEvent.image && typeof newEvent.image !== 'string') {
        formData.append('image', newEvent.image);
      }
      formData.append('attendees', newEvent.attendees.toString());
      formData.append('targetAge', newEvent.targetAge);

      try {
        const response = await axios.post(`/api/announcement/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        const newEventData = {
          id: response.data.data.id,
          title: newEvent.title === 'Other' ? newEvent.customTitle : newEvent.title,
          date: newEvent.date,
          time: `${newEvent.customStartTime}-${newEvent.customEndTime}`,
          location: newEvent.location === 'Other' ? newEvent.customLocation : newEvent.location,
          status: newEvent.status,
          description: newEvent.description,
          image: response.data.data.attributes?.image || null,
          attendees: newEvent.attendees,
          targetAge: newEvent.targetAge
        };

        setEvents(prevEvents => [...prevEvents, newEventData]);
        setShowAddModal(false);
        setNewEvent({
          title: '',
          customTitle: '',
          date: '',
          time: '',
          customStartTime: '',
          customEndTime: '',
          location: '',
          customLocation: '',
          status: 'Scheduled',
          description: '',
          image: null,
          attendees: 0,
          targetAge: ''
        });
      } catch (error) {
        console.error('Error adding event:', error);
      }
    });
  };

  const handleDeleteEvent = async (id: number) => {
    setEventToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      const authToken = localStorage.getItem('accessToken');
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      await axios.patch(`/api/announcement/${eventToDelete}/`, 
        { status: 'Deleted' },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      // Update local state
      const deletedEvent = events.find(event => event.id === eventToDelete);
      if (deletedEvent) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete));
        setDeletedEvents(prevDeletedEvents => [...prevDeletedEvents, {...deletedEvent, status: 'Deleted'}]);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  const handleUndoDelete = async (id: number) => {
    const eventToRestore = deletedEvents.find(event => event.id === id);
    if (eventToRestore) {
      try {
        const authToken = localStorage.getItem('accessToken');
        if (!authToken) {
          console.error('No auth token found');
          return;
        }

        const response = await axios.patch(`/api/announcement/${id}/`, { status: 'Upcoming' }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (response.status === 200) {
          setEvents([...events, { ...eventToRestore, status: 'Upcoming' }]);
          setDeletedEvents(deletedEvents.filter(event => event.id !== id));
        } else {
          console.error('Failed to restore event:', response.statusText);
        }
      } catch (error) {
        console.error('Error restoring event:', error);
      }
    }
  };

  const [editEvent, setEditEvent] = useState<Event>({
    id: '',
    title: '',
    customTitle: '',
    date: '',
    time: '',
    customStartTime: '',
    customEndTime: '',
    location: '',
    customLocation: '',
    status: '',
    description: '',
    image: null,
    attendees: 0,
    targetAge: ''
  });

  const handleEditEvent = (event: Event) => {
    setEditEvent({
      id: event.id,
      title: event.title,
      customTitle: '',
      date: event.date,
      time: event.time,
      customStartTime: event.time.split('-')[0],
      customEndTime: event.time.split('-')[1],
      location: event.location,
      customLocation: '',
      status: event.status,
      description: event.description,
      image: event.image,
      attendees: event.attendees,
      targetAge: event.targetAge
    });
    setShowEditModal(true);
  };

  const handleEditEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date for completed status
    if (editEvent.status === 'Completed') {
      const eventDate = new Date(editEvent.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day

      if (eventDate > today) {
        alert("Cannot mark an event as completed before its scheduled date.");
        return;
      }
    }

    const formData = new FormData();
    formData.append('title', editEvent.title === 'Other' ? editEvent.customTitle : editEvent.title);
    formData.append('date', editEvent.date);
    formData.append('time', `${editEvent.customStartTime}-${editEvent.customEndTime}`);
    formData.append('location', editEvent.location === 'Other' ? editEvent.customLocation : editEvent.location);
    formData.append('status', editEvent.status);
    formData.append('description', editEvent.description);
    if (editEvent.image && typeof editEvent.image !== 'string') {
      formData.append('image', editEvent.image);
    }
    formData.append('attendees', editEvent.attendees.toString());
    formData.append('targetAge', editEvent.targetAge);

    try {
      const response = await axios.patch(`/api/announcement/${editEvent.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.status === 200) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === editEvent.id
              ? {
                  ...event,
                  title: editEvent.title === 'Other' ? editEvent.customTitle : editEvent.title,
                  date: editEvent.date,
                  time: `${editEvent.customStartTime}-${editEvent.customEndTime}`,
                  location: editEvent.location === 'Other' ? editEvent.customLocation : editEvent.location,
                  status: editEvent.status,
                  description: editEvent.description,
                  image: response.data.data.attributes?.image || event.image,
                  attendees: editEvent.attendees,
                  targetAge: editEvent.targetAge
                }
              : event
          )
        );

        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <BackgroundElements />
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/admin')}
              variant="outline"
              className="text-[#1A202C]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-dm-sans font-bold text-[#1A202C]"
            >
              Medical Events
            </motion.h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#ABF600] text-[#1A202C] hover:bg-[#9DE100]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
            <Button
              onClick={() => setShowTrashModal(true)}
              variant="outline"
              className="border-2 border-[#1A202C] text-[#1A202C] hover:bg-[#1A202C] hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Trash
            </Button>
          </div>
        </div>

        {/* Event grid with loading state and empty state */}
        {isLoading ? (
          [...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 animate-pulse"
            >
              <div className="relative h-56 w-full bg-gray-200" />
              <div className="p-6">
                <div className="absolute top-4 right-4">
                  <div className="w-24 h-6 bg-gray-200 rounded-full" />
                </div>
                <div className="h-7 bg-gray-200 rounded-lg mb-3 w-3/4" />
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="ml-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-16 mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="ml-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-16 mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="ml-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-40" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="ml-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-28" />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="ml-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                      <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <div className="w-24 h-9 bg-gray-200 rounded-md" />
                  <div className="w-24 h-9 bg-gray-200 rounded-md" />
                </div>
              </div>
            </div>
          ))
        ) : events.length > 0 ? (
          // Actual event cards when we have events
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-56 w-full group">
                  {event.image ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <DefaultEventImage />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                      <span className="w-2 h-2 mr-2 inline-block rounded-full bg-current"></span>
                      {event.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1A202C] mb-3 line-clamp-1 hover:line-clamp-none">
                    {event.title}
                  </h3>
                  <div className="mb-6">
                    <p className={`text-[#1A202C]/70 ${expandedDescriptions[event.id] ? '' : 'line-clamp-3'}`}>
                      {event.description}
                    </p>
                    {event.description.length > 150 && (
                      <button
                        onClick={() => setExpandedDescriptions(prev => ({
                          ...prev,
                          [event.id]: !prev[event.id]
                        }))}
                        className="text-blue-600 hover:text-blue-700 text-sm mt-2 focus:outline-none"
                      >
                        {expandedDescriptions[event.id] ? 'Show Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-[#1A202C] group">
                      <div className="w-8">
                        <Calendar className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
                      </div>
                      <div>
                        <span className="font-medium">When:</span>
                        <div className="text-[#1A202C]/70">{event.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-[#1A202C] group">
                      <div className="w-8">
                        <Clock className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors" />
                      </div>
                      <div>
                        <span className="font-medium">Time:</span>
                        <div className="text-[#1A202C]/70">
                          {event.time ? (
                            <>
                              {formatAMPM(event.time.split('-')[0])} - {formatAMPM(event.time.split('-')[1])}
                            </>
                          ) : (
                            'Time not set'
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-[#1A202C] group">
                      <div className="w-8">
                        <MapPin className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors" />
                      </div>
                      <div>
                        <span className="font-medium">Where:</span>
                        <div className="text-[#1A202C]/70">{event.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-[#1A202C] group">
                      <div className="w-8">
                        <svg 
                          className="w-5 h-5 text-amber-600 group-hover:text-amber-700 transition-colors" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M12 2v4" />
                          <path d="M12 18v4" />
                          <path d="M4.93 4.93l2.83 2.83" />
                          <path d="M16.24 16.24l2.83 2.83" />
                          <path d="M2 12h4" />
                          <path d="M18 12h4" />
                          <path d="M4.93 19.07l2.83-2.83" />
                          <path d="M16.24 7.76l2.83-2.83" />
                          <circle cx="12" cy="12" r="5" />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium">Age Group:</span>
                        <div className="text-[#1A202C]/70">{event.targetAge || 'All Ages'}</div>
                      </div>
                    </div>
                    <div className="flex items-center text-[#1A202C] group">
                      <div className="w-8">
                        <Users className="w-5 h-5 text-teal-600 group-hover:text-teal-700 transition-colors" />
                      </div>
                      <div>
                        <span className="font-medium">Expected Attendees:</span>
                        <div className="text-[#1A202C]/70">{event.attendees} people</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Empty state when no events are available
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            <div className="relative w-64 h-64 mb-6">
              <svg 
                viewBox="0 0 24 24" 
                className="w-full h-full text-gray-200"
                fill="currentColor"
              >
                <path d="M19,4h-2V2h-2v2H9V2H7v2H5C3.897,4,3,4.897,3,6v14c0,1.103,0.897,2,2,2h14c1.103,0,2-0.897,2-2V6C21,4.897,20.103,4,19,4z M19,20 H5V10h14V20z M19,8H5V6h14V8z"></path>
                <path d="M12,15c-0.553,0-1-0.447-1-1s0.447-1,1-1s1,0.447,1,1S12.553,15,12,15z"></path>
                <path d="M16,15c-0.553,0-1-0.447-1-1s0.447-1,1-1s1,0.447,1,1S16.553,15,16,15z"></path>
                <path d="M8,15c-0.553,0-1-0.447-1-1s0.447-1,1-1s1,0.447,1,1S8.553,15,8,15z"></path>
                <path d="M12,19c-0.553,0-1-0.447-1-1s0.447-1,1-1s1,0.447,1,1S12.553,19,12,19z"></path>
                <path d="M16,19c-0.553,0-1-0.447-1-1s0.447-1,1-1s1,0.447,1,1S16.553,19,16,19z"></path>
                <path d="M8,19c-0.553,0-1-0.447-1-1s0.447-1,1-1s1,0.447,1,1S8.553,19,8,19z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="w-24 h-24 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Events Found</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              There are currently no scheduled medical events. Create your first event to get started.
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#ABF600] text-[#1A202C] hover:bg-[#9DE100]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Event
            </Button>
          </motion.div>
        )}

        {/* Add Event Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#F3F3F3] p-8 rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto relative"
              >
                <h2 className="text-2xl font-bold text-[#1A202C] mb-6">Add Event</h2>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Event Title
                    </label>
                    <select
                      value={newEvent.title}
                      onChange={(e) => {
                        const selectedTitle = e.target.value;
                        if (selectedTitle === 'Other') {
                          setNewEvent({ 
                            ...newEvent, 
                            title: selectedTitle,
                            description: ''
                          });
                        } else {
                          setNewEvent({ 
                            ...newEvent, 
                            title: selectedTitle,
                            customTitle: '',
                            description: COMMON_EVENTS[selectedTitle as keyof typeof COMMON_EVENTS] || ''
                          });
                        }
                      }}
                      className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                      required
                    >
                      <option value="">Select an event type</option>
                      {Object.keys(COMMON_EVENTS).map((eventType) => (
                        <option key={eventType} value={eventType}>
                          {eventType}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Custom Title Input - Only show if "Other" is selected */}
                  {newEvent.title === 'Other' && (
                    <div>
                      <label className="block text-[#1A202C] font-dm-sans mb-1">
                        Custom Event Title
                      </label>
                      <input
                        type="text"
                        value={newEvent.customTitle}
                        onChange={(e) => setNewEvent({ ...newEvent, customTitle: e.target.value })}
                        className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                        required
                        placeholder="Enter your event title"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // Reset time to start of day
                          
                          if (selectedDate < today) {
                            alert("Cannot create events for past dates. Please select today or a future date.");
                            return;
                          }
                          
                          setNewEvent({ ...newEvent, date: e.target.value });
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                        required
                      />
                      <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black pointer-events-none" />
                    </div>
                  </div>

                  {/* Location Selection */}
                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Location
                    </label>
                    <select
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value, customLocation: '' })}
                      className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                      required
                    >
                      <option value="">Select a location</option>
                      {COMMON_LOCATIONS.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Custom Location Input - Only show if "Other" is selected */}
                  {newEvent.location === 'Other' && (
                    <div>
                      <label className="block text-[#1A202C] font-dm-sans mb-1">
                        Custom Location
                      </label>
                      <input
                        type="text"
                        value={newEvent.customLocation}
                        onChange={(e) => setNewEvent({ ...newEvent, customLocation: e.target.value })}
                        className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                        required
                        placeholder="Enter the event location"
                      />
                    </div>
                  )}

                  {/* Time Selection */}
                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Time Duration
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#1A202C]/70 mb-1">
                          Start Time
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="time"
                              value={newEvent.customStartTime}
                              onChange={(e) => {
                                const startTime = e.target.value;
                                const [hours] = startTime.split(':').map(Number);
                                if (hours >= 5 && hours < 16) {
                                  setNewEvent({ ...newEvent, customStartTime: startTime });
                                } else {
                                  alert('Please select a start time between 5:00 AM and 4:00 PM');
                                }
                              }}
                              min="05:00"
                              max="16:00"
                              className="w-full p-2 pl-3 pr-10 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              required
                              style={{
                                colorScheme: 'light'
                              }}
                            />
                          </div>
                          <span className="text-[#1A202C]/70">
                            {newEvent.customStartTime ? 
                              formatAMPM(newEvent.customStartTime) : 
                              'AM/PM'
                            }
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-[#1A202C]/70 mb-1">
                          End Time
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="time"
                              value={newEvent.customEndTime}
                              onChange={(e) => {
                                const endTime = e.target.value;
                                const [hours] = endTime.split(':').map(Number);
                                if (hours >= 5 && hours <= 16) {
                                  setNewEvent({ ...newEvent, customEndTime: endTime });
                                } else {
                                  alert('Please select an end time between 5:00 AM and 4:00 PM');
                                }
                              }}
                              min="05:00"
                              max="16:00"
                              className="w-full p-2 pl-3 pr-10 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              required
                              style={{
                                colorScheme: 'light'
                              }}
                            />
                          </div>
                          <span className="text-[#1A202C]/70">
                            {newEvent.customEndTime ? 
                              formatAMPM(newEvent.customEndTime) : 
                              'AM/PM'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[#1A202C]/70 mt-1">
                      Event time must be between 5:00 AM and 4:00 PM
                    </p>
                  </div>

                  {/* Expected Attendees Field */}
                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Expected Attendees
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newEvent.attendees}
                      onChange={(e) => setNewEvent({ ...newEvent, attendees: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                      required
                      placeholder="Enter expected number of attendees"
                    />
                  </div>

                  {/* Target Age Group Field */}
                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Target Age Group
                    </label>
                    <select
                      value={newEvent.targetAge}
                      onChange={(e) => setNewEvent({ ...newEvent, targetAge: e.target.value })}
                      className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                      required
                    >
                      <option value="">Select target age group</option>
                      {AGE_GROUPS.map((ageGroup) => (
                        <option key={ageGroup} value={ageGroup}>
                          {ageGroup}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Image Upload Field */}
                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Event Image
                    </label>
                    <div className="flex flex-col gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewEvent({ ...newEvent, image: file });
                          }
                        }}
                        className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                      />
                      {newEvent.image && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                          <Image
                            src={typeof newEvent.image === 'string' ? newEvent.image : URL.createObjectURL(newEvent.image)}
                            alt="Event preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Description
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent min-h-[100px]"
                      required
                      placeholder="Enter event description"
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddModal(false)}
                      className="border-2 border-[#1A202C] text-[#1A202C] hover:bg-[#1A202C] hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#ABF600] text-[#1A202C] hover:bg-[#9DE100]"
                    >
                      Add Event
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                >
                  No, Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Yes, Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Trash Modal */}
        <AnimatePresence>
          {showTrashModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md my-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#1A202C]">Trash</h2>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {deletedEvents.length} items
                  </span>
                </div>
                
                {deletedEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No deleted events</p>
                  </div>
                ) : (
                  <ul className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {deletedEvents.map((event) => (
                      <li 
                        key={event.id} 
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 mr-4">
                          <h3 className="font-medium text-[#1A202C] line-clamp-1">{event.title}</h3>
                          <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                          onClick={() => handleUndoDelete(event.id)}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restore
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTrashModal(false)}
                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Event Modal */}
        <AnimatePresence>
          {showEditModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#F3F3F3] p-8 rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto relative"
              >
                <h2 className="text-2xl font-bold text-[#1A202C] mb-6">Edit Event</h2>
                <form onSubmit={handleEditEventSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Event Title
                    </label>
                    <select
                      value={editEvent.title}
                      onChange={(e) => {
                        const selectedTitle = e.target.value;
                        if (selectedTitle === 'Other') {
                          setEditEvent({ 
                            ...editEvent, 
                            title: selectedTitle,
                            description: ''
                          });
                        } else {
                          setEditEvent({ 
                            ...editEvent, 
                            title: selectedTitle,
                            customTitle: '',
                            description: COMMON_EVENTS[selectedTitle as keyof typeof COMMON_EVENTS] || ''
                          });
                        }
                      }}
                      className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                      required
                    >
                      <option value="">Select an event type</option>
                      {Object.keys(COMMON_EVENTS).map((eventType) => (
                        <option key={eventType} value={eventType}>
                          {eventType}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Custom Title Input - Only show if "Other" is selected */}
                  {editEvent.title === 'Other' && (
                    <div>
                      <label className="block text-[#1A202C] font-dm-sans mb-1">
                        Custom Event Title
                      </label>
                      <input
                        type="text"
                        value={editEvent.customTitle}
                        onChange={(e) => setEditEvent({ ...editEvent, customTitle: e.target.value })}
                        className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                        required
                        placeholder="Enter your event title"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={editEvent.date}
                        onChange={(e) => {
                          const selectedDate = new Date(e.target.value);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0); // Reset time to start of day
                          
                          if (selectedDate < today && editEvent.status !== 'Completed') {
                            alert("Cannot select past dates. Please select today or a future date.");
                            return;
                          }
                          
                          if (editEvent.status === 'Completed' && selectedDate > today) {
                            alert("Cannot set a future date for a completed event.");
                            return;
                          }
                          
                          setEditEvent({ ...editEvent, date: e.target.value });
                        }}
                        min={editEvent.status === 'Completed' ? undefined : new Date().toISOString().split('T')[0]}
                        className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                        required
                      />
                      <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#1A202C] font-dm-sans mb-1">
                        Start Time
                      </label>
                      <select
                        value={editEvent.customStartTime}
                        onChange={(e) => setEditEvent({ ...editEvent, customStartTime: e.target.value })}
                        className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                        required
                      >
                        <option value="">Select start time</option>
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot.start} value={slot.start}>
                            {formatAMPM(slot.start)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#1A202C] font-dm-sans mb-1">
                        End Time
                      </label>
                      <select
                        value={editEvent.customEndTime}
                        onChange={(e) => setEditEvent({ ...editEvent, customEndTime: e.target.value })}
                        className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                        required
                      >
                        <option value="">Select end time</option>
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot.end} value={slot.end}>
                            {formatAMPM(slot.end)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Location
                    </label>
                    <select
                      value={editEvent.location}
                      onChange={(e) => {
                        const selectedLocation = e.target.value;
                        setEditEvent({
                          ...editEvent,
                          location: selectedLocation,
                          customLocation: selectedLocation === 'Other' ? '' : editEvent.customLocation
                        });
                      }}
                      className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                      required
                    >
                      <option value="">Select a location</option>
                      {COMMON_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Custom Location Input - Only show if "Other" is selected */}
                  {editEvent.location === 'Other' && (
                    <div>
                      <label className="block text-[#1A202C] font-dm-sans mb-1">
                        Custom Location
                      </label>
                      <input
                        type="text"
                        value={editEvent.customLocation}
                        onChange={(e) => setEditEvent({ ...editEvent, customLocation: e.target.value })}
                        className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                        required
                        placeholder="Enter custom location"
                      />
                    </div>
                  )}

                  {/* Expected Attendees Field */}
                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Expected Attendees
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editEvent.attendees}
                      onChange={(e) => setEditEvent({ ...editEvent, attendees: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                      required
                      placeholder="Enter expected number of attendees"
                    />
                  </div>

                  {/* Target Age Group Field */}
                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Target Age Group
                    </label>
                    <select
                      value={editEvent.targetAge}
                      onChange={(e) => setEditEvent({ ...editEvent, targetAge: e.target.value })}
                      className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                      required
                    >
                      <option value="">Select target age group</option>
                      {AGE_GROUPS.map((ageGroup) => (
                        <option key={ageGroup} value={ageGroup}>
                          {ageGroup}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Image Upload Field */}
                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Event Image
                    </label>
                    <div className="flex flex-col gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEditEvent({ ...editEvent, image: file });
                          }
                        }}
                        className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                      />
                      {editEvent.image && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                          <Image
                            src={typeof editEvent.image === 'string' ? editEvent.image : URL.createObjectURL(editEvent.image)}
                            alt="Event preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Description
                    </label>
                    <textarea
                      value={editEvent.description}
                      onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                      className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent min-h-[100px]"
                      required
                      placeholder="Enter event description"
                    />
                  </div>

                  <div>
                    <label className="block text-[#1A202C] font-dm-sans mb-1">
                      Status
                    </label>
                    <select
                      value={editEvent.status}
                      onChange={(e) => setEditEvent({ ...editEvent, status: e.target.value })}
                      className="w-full p-2 border rounded bg-white text-black focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                      required
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-4 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditModal(false)}
                      className="border-2 border-[#1A202C] text-[#1A202C] hover:bg-[#1A202C] hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#ABF600] text-[#1A202C] hover:bg-[#9DE100]"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default MedicalEvents;