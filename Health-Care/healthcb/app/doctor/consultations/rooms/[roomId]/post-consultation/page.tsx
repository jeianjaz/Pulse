'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import consultationApi from '@/services/consultationApi';
import consultationRecordApi from '@/services/consultationRecordApi';

const ConsultationOverview = ({ data }) => {

  if (!data) return null;
  
  const consultation = data.consultation || data;
  const record = data.record;
  const { patient, doctor, date, start_time, end_time, status, request, health_prediction } = consultation;
  
  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState({
    patientInfo: true,
    appointmentDetails: true,
    healthPrediction: true,
    symptoms: true,
    notes: true
  });
  
  // Toggle section visibility
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper function to format symptoms
  const formatSymptoms = (symptoms) => {
    if (!symptoms) return 'No symptoms data available';
    
    return Object.entries(symptoms)
      .filter(([_, value]) => value === true || value === 'Yes')
      .map(([key]) => key)
      .join(', ');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 sticky top-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b flex justify-between">
        Consultation Overview
        <button 
          onClick={() => {
            const allExpanded = Object.values(expandedSections).every(v => v);
            const newState = !allExpanded;
            setExpandedSections({
              patientInfo: newState,
              appointmentDetails: newState,
              healthPrediction: newState,
              symptoms: newState,
              notes: newState
            });
          }}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {Object.values(expandedSections).every(v => v) ? 'Collapse All' : 'Expand All'}
        </button>
      </h2>
      
      {/* Patient Info Section */}
      <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className="bg-blue-50 p-2 cursor-pointer flex justify-between items-center"
          onClick={() => toggleSection('patientInfo')}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-700">Patient: {patient.first_name} {patient.last_name}</h3>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${expandedSections.patientInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {expandedSections.patientInfo && (
          <div className="p-3">
            <p className="text-sm text-gray-600">Email: {patient.email}</p>
            <p className="text-sm text-gray-600">Username: {patient.username}</p>
          </div>
        )}
      </div>
      
      {/* Appointment Details Section */}
      <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className="bg-purple-50 p-2 cursor-pointer flex justify-between items-center"
          onClick={() => toggleSection('appointmentDetails')}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-700">Appointment: {date}</h3>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${expandedSections.appointmentDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {expandedSections.appointmentDetails && (
          <div className="p-3 space-y-1">
            <p className="text-sm text-gray-600">Time: {start_time.substring(0, 5)} - {end_time.substring(0, 5)}</p>
            <p className="text-sm text-gray-600">
              Status: <span className="capitalize px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium text-xs">{status.replace('_', ' ')}</span>
            </p>
            <p className="text-sm text-gray-600">Room: {consultation.room} ({consultation.room_type})</p>
            <p className="text-sm text-gray-600">Doctor: Dr. {doctor.first_name} {doctor.last_name} ({doctor.specialization})</p>
          </div>
        )}
      </div>
      
      {/* Health Prediction Section */}
      {health_prediction && (
        <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className="bg-indigo-50 p-2 cursor-pointer flex justify-between items-center"
            onClick={() => toggleSection('healthPrediction')}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-700">AI Prediction: {health_prediction.predicted_disease}</h3>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${expandedSections.healthPrediction ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {expandedSections.healthPrediction && (
            <div className="p-3">
              <div className="mb-2">
                <span className="text-xs text-gray-500">Confidence ({Math.round(health_prediction.probability * 100)}%)</span>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full" 
                    style={{ width: `${Math.round(health_prediction.probability * 100)}%` }}
                  />
                </div>
              </div>
              
              {health_prediction.significant_probabilities && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Other Possibilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(health_prediction.significant_probabilities)
                      .filter(([disease]) => disease !== health_prediction.predicted_disease)
                      .slice(0, 2)
                      .map(([disease, probability]) => (
                        <span key={disease} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {disease}: {Math.round(probability as number * 100)}%
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Symptoms Section */}
      {request?.symptoms && (
        <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className="bg-red-50 p-2 cursor-pointer flex justify-between items-center"
            onClick={() => toggleSection('symptoms')}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-700">Symptoms & Reason: {request.reason}</h3>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${expandedSections.symptoms ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {expandedSections.symptoms && (
            <div className="p-3">
              <div className="flex flex-wrap gap-1 mb-2">
                {Object.entries(request.symptoms)
                  .filter(([_, value]) => value === true || value === "Yes")
                  .map(([symptom]) => (
                    <span key={symptom} className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                      {symptom}
                    </span>
                  ))}
              </div>
              
              {request.additional_notes && (
                <div>
                  <p className="text-xs text-gray-500">Notes:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{request.additional_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Consultation Notes Section */}
      {record?.consultation_notes && (
        <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className="bg-amber-50 p-2 cursor-pointer flex justify-between items-center"
            onClick={() => toggleSection('notes')}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-700">Consultation Notes</h3>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${expandedSections.notes ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {expandedSections.notes && (
            <div className="p-3">
              <p className="text-sm text-gray-600 whitespace-pre-line">{record.consultation_notes}</p>
              
              {record.consultation_notes_updated_at && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  Last updated: {new Date(record.consultation_notes_updated_at).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function CompleteConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [consultationRecord, setConsultationRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    diagnosis: '',
    prescribed_medications: '',
    treatment_plan: '',
    post_consultation_notes: '',
    requires_followup: false,
    followup_date: '',
    followup_notes: '',
    attachments: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const response = await consultationRecordApi.getRecordByRoomId(roomId);
        if (response.data) {
          setConsultationRecord(response.data);
          console.log('Fetched consultation record:', response.data);
          
          const record = response.data.record;
          if (record) {
            setFormData(prev => ({
              ...prev,
              diagnosis: record.diagnosis || '',
              prescribed_medications: record.prescribed_medications || '',
              treatment_plan: record.treatment_plan || '',
              post_consultation_notes: record.post_consultation_notes || '',
              requires_followup: record.requires_followup || false,
              followup_date: record.followup_date || '',
              followup_notes: record.followup_notes || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching record:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [roomId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({...formData, attachments: e.target.files[0]});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consultationRecord || !consultationRecord.record) {
      console.error('No consultation record found');
      return;
    }

    try {
      setIsSubmitting(true);
      const submissionData = {
        diagnosis: formData.diagnosis,
        prescribed_medications: formData.prescribed_medications,
        treatment_plan: formData.treatment_plan,
        post_consultation_notes: formData.post_consultation_notes,
        requires_followup: formData.requires_followup,
        followup_date: formData.requires_followup ? formData.followup_date : null,
        followup_notes: formData.requires_followup ? formData.followup_notes : '',
      };

      console.log('Submitting data:', JSON.stringify(submissionData));

      // Use the consultationApi service which handles authentication correctly
      const response = await consultationApi.completeConsultation(
        consultationRecord.record.id,
        submissionData
      );

      console.log('Response:', response);

      // Handle file attachment if present
      if (formData.attachments) {
        await consultationRecordApi.uploadAttachment(
          parseInt(consultationRecord.record.id),
          formData.attachments
        );
      }

      router.push('/doctor/consultations');
      router.refresh();
    } catch (error) {
      console.error('Error completing consultation:', error);
      // Show more detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Status code:', error.response.status);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            {consultationRecord && <ConsultationOverview data={consultationRecord} />}
          </div>
          
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b">Complete Consultation</h2>
              
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                <div className="relative">
                  <textarea 
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-4 py-2 bg-gray-50 transition duration-150 ease-in-out"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    rows={3}
                    required
                    placeholder="Enter patient diagnosis..."
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Provide a clear and detailed diagnosis based on your assessment</p>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed Medications</label>
                <div className="relative">
                  <textarea 
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-4 py-2 bg-gray-50 transition duration-150 ease-in-out"
                    value={formData.prescribed_medications}
                    onChange={(e) => setFormData({...formData, prescribed_medications: e.target.value})}
                    rows={3}
                    required
                    placeholder="Enter prescription details..."
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Include medication name, dosage, frequency and duration</p>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan</label>
                <div className="relative">
                  <textarea 
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-4 py-2 bg-gray-50 transition duration-150 ease-in-out"
                    value={formData.treatment_plan}
                    onChange={(e) => setFormData({...formData, treatment_plan: e.target.value})}
                    rows={3}
                    required
                    placeholder="Enter treatment plan..."
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Outline the recommended treatment steps and any lifestyle changes</p>
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <div className="relative">
                  <textarea 
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-4 py-2 bg-gray-50 transition duration-150 ease-in-out"
                    value={formData.post_consultation_notes}
                    onChange={(e) => setFormData({...formData, post_consultation_notes: e.target.value})}
                    rows={3}
                    placeholder="Enter any additional information..."
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mt-6">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="requires_followup"
                    checked={formData.requires_followup}
                    onChange={(e) => setFormData({...formData, requires_followup: e.target.checked})}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition duration-150 ease-in-out cursor-pointer"
                  />
                  <label htmlFor="requires_followup" className="ml-2 block text-sm font-medium text-gray-900 cursor-pointer">
                    Requires Follow-up
                  </label>
                </div>

                {formData.requires_followup && (
                  <div className="space-y-4 pl-7 border-l-2 border-blue-200 mt-2">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="date"
                          value={formData.followup_date}
                          onChange={(e) => setFormData({...formData, followup_date: e.target.value})}
                          className="mt-1 block w-full pl-10 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-4 py-2 bg-white transition duration-150 ease-in-out"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Notes</label>
                      <textarea
                        value={formData.followup_notes}
                        onChange={(e) => setFormData({...formData, followup_notes: e.target.value})}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-4 py-2 bg-white transition duration-150 ease-in-out"
                        rows={2}
                        placeholder="Enter reasons for follow-up..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition duration-150 ease-in-out">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, PNG, JPG up to 10MB
                    </p>
                    {formData.attachments && (
                      <p className="text-sm text-green-600 font-medium">
                        File selected: {formData.attachments.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-white text-gray-700 mr-4 px-6 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center px-6 py-2 rounded-md shadow-sm text-white ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'} transition duration-150 ease-in-out`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Complete Consultation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}