'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, CheckCircle2, XCircle, Search, Filter, Clock, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BackgroundElements from '@/components/BackgroundElements';
import axios from 'axios';

interface VolunteerApplication {
  id: number;
  eventId: number;
  eventTitle: string;
  name: string;
  email: string;
  phone: string;
  residencyStatus: 'resident' | 'non-resident';
  status: 'pending' | 'approved' | 'rejected';
  skills: string[];
  availability: string;
  appliedAt: string;
  location: string;
}

export default function VolunteerDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedResidency, setSelectedResidency] = useState<string>('all');
  
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [events, setEvents] = useState<{ id: number; title: string; }[]>([
    { id: 1, title: "Medical Mission 2024" },
    { id: 2, title: "Dental Care Outreach" }
  ]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          ...(searchQuery && { search: searchQuery }),
          ...(selectedEvent !== 'all' && { event: selectedEvent }),
          ...(selectedStatus !== 'all' && { status: selectedStatus }),
          ...(selectedResidency !== 'all' && { residency: selectedResidency }),
        });

        const response = await axios.get(
          `/api/volunteers/list/?${params}`
        );
        
        // Transform the backend data to match our frontend interface
        const transformedData = response.data.data.map((volunteer: any) => ({
          id: parseInt(volunteer.id),
          eventId: 1, // Default value since it's not in the response
          eventTitle: volunteer.attributes.opportunity_title,
          name: volunteer.attributes.full_name,
          email: volunteer.attributes.email,
          phone: volunteer.attributes.phone,
          residencyStatus: 'resident', // Default value since it's not in the response
          status: volunteer.attributes.status.toLowerCase(),
          skills: [], // Default value since it's not in the response
          availability: volunteer.attributes.availability,
          appliedAt: volunteer.attributes.created_at,
          location: volunteer.attributes.address,
        }));

        setApplications(transformedData);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
        alert('Failed to fetch volunteer applications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolunteers();
  }, [searchQuery, selectedEvent, selectedStatus, selectedResidency]);

  // Update handleApprove function
  const handleApprove = async (applicationId: number) => {
    try {
      setIsLoading(true);
      await axios.post(`/api/volunteers/${applicationId}/approve/`);
      
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'approved' }
            : app
        )
      );

      alert('Volunteer application approved successfully!');
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (applicationId: number) => {
    try {
      setIsLoading(true);
      await axios.post(`/api/volunteers/${applicationId}/reject/`);
      
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'rejected' }
            : app
        )
      );

      alert('Volunteer application rejected.');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the filteredApplications logic since filtering is now handled by the backend
  const filteredApplications = applications;

  return (
    <main className="min-h-screen bg-[#FAFAFA] p-8">
      <BackgroundElements />
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <ArrowLeft 
              className="w-8 h-8 text-[#1A202C] cursor-pointer hover:text-gray-700 transition-colors" 
              onClick={() => router.back()}
            />
            <h1 className="text-4xl font-dm-sans font-bold text-[#1A202C]">
              Volunteer Applications
            </h1>
          </div>
        </motion.div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent bg-white text-gray-900 placeholder-gray-500 hover:border-gray-300 transition-colors"
            />
          </div>

          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent bg-white text-gray-900 hover:border-gray-300 transition-colors cursor-pointer"
          >
            <option value="all" className="text-gray-900">All Events</option>
            {events.map(event => (
              <option key={event.id} value={event.id} className="text-gray-900">{event.title}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent bg-white text-gray-900 hover:border-gray-300 transition-colors cursor-pointer"
          >
            <option value="all" className="text-gray-900">All Status</option>
            <option value="pending" className="text-gray-900">Pending</option>
            <option value="approved" className="text-gray-900">Approved</option>
            <option value="rejected" className="text-gray-900">Rejected</option>
          </select>

          <select
            value={selectedResidency}
            onChange={(e) => setSelectedResidency(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent bg-white text-gray-900 hover:border-gray-300 transition-colors cursor-pointer"
          >
            <option value="all" className="text-gray-900">All Residency</option>
            <option value="resident" className="text-gray-900">Resident</option>
            <option value="non-resident" className="text-gray-900">Non-Resident</option>
          </select>
        </div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Event</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Volunteer Info</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Availability</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                      <p className="text-gray-500">No volunteer applications match your current filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{app.eventTitle}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-gray-900">{app.name}</div>
                        <div className="text-sm text-gray-500">{app.email}</div>
                        <div className="text-sm text-gray-500">{app.phone}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{app.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{app.availability}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.residencyStatus === 'resident' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {app.residencyStatus === 'resident' ? 'Resident' : 'Non-Resident'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="p-2 hover:bg-green-50 rounded-full transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Approve"
                            disabled={isLoading || app.status === 'approved' || app.status === 'rejected'}
                          >
                            <CheckCircle2 className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="p-2 hover:bg-red-50 rounded-full transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject"
                            disabled={isLoading || app.status === 'approved' || app.status === 'rejected'}
                          >
                            <XCircle className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
