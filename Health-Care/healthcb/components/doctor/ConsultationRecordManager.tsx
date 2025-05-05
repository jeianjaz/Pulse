'use client';

import { useState, useEffect } from 'react';
import { PencilLine, Save, CheckCircle, Calendar, Clock, User, PlusCircle, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import consultationRecordApi from '@/services/consultationRecordApi';
import { ConsultationRecordModel, PrescribedMedication } from '@/types/api-models';
import toast from 'react-hot-toast';

interface CompleteConsultationModalProps {
  record: ConsultationRecordModel;
  onClose: () => void;
  onComplete: (data: {
    diagnosis: string;
    prescribedMedications: PrescribedMedication[];
    treatmentPlan: string;
    postConsultationNotes: string;
    requiresFollowup: boolean;
    followupDate?: string;
    followupNotes?: string;
  }) => void;
}

const CompleteConsultationModal = ({ record, onClose, onComplete }: CompleteConsultationModalProps) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState<PrescribedMedication[]>([
    { name: '', dosage: '', frequency: '' }
  ]);
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [postConsultationNotes, setPostConsultationNotes] = useState('');
  const [requiresFollowup, setRequiresFollowup] = useState(false);
  const [followupDate, setFollowupDate] = useState('');
  const [followupNotes, setFollowupNotes] = useState('');
  
  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '' }]);
  };
  
  const removeMedication = (index: number) => {
    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    setMedications(updatedMedications);
  };
  
  const updateMedication = (index: number, field: keyof PrescribedMedication, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onComplete({
      diagnosis,
      prescribedMedications: medications.filter(med => med.name && med.dosage && med.frequency),
      treatmentPlan,
      postConsultationNotes,
      requiresFollowup,
      followupDate: requiresFollowup ? followupDate : undefined,
      followupNotes: requiresFollowup ? followupNotes : undefined
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Complete Consultation</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full border rounded p-2 h-24"
              placeholder="Enter your diagnosis"
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Prescribed Medications</label>
              <button
                type="button"
                onClick={addMedication}
                className="text-blue-600 text-sm flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Add Medication
              </button>
            </div>
            
            {medications.map((medication, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <div className="grid grid-cols-3 gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Medication name"
                    value={medication.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    className="border rounded p-2 text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g., 10mg)"
                    value={medication.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    className="border rounded p-2 text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Frequency (e.g., twice daily)"
                    value={medication.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    className="border rounded p-2 text-sm"
                    required
                  />
                </div>
                {medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan</label>
            <textarea
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              className="w-full border rounded p-2 h-24"
              placeholder="Describe the recommended treatment plan"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post-Consultation Notes</label>
            <textarea
              value={postConsultationNotes}
              onChange={(e) => setPostConsultationNotes(e.target.value)}
              className="w-full border rounded p-2 h-24"
              placeholder="Any additional notes or observations"
            />
          </div>
          
          <div className="pt-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="requiresFollowup"
                checked={requiresFollowup}
                onChange={() => setRequiresFollowup(!requiresFollowup)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresFollowup" className="ml-2 text-sm text-gray-700">
                Requires Follow-up Appointment
              </label>
            </div>
            
            {requiresFollowup && (
              <div className="ml-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    className="border rounded p-2 w-full"
                    required={requiresFollowup}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Notes</label>
                  <textarea
                    value={followupNotes}
                    onChange={(e) => setFollowupNotes(e.target.value)}
                    className="w-full border rounded p-2 h-16"
                    placeholder="Reason for follow-up and special instructions"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded mr-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Complete Consultation
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface ConsultationRecordManagerProps {
  consultationId: number;
  patientName: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
}

export default function ConsultationRecordManager({
  consultationId,
  patientName,
  date,
  startTime,
  endTime,
  roomId
}: ConsultationRecordManagerProps) {
  const [record, setRecord] = useState<ConsultationRecordModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    fetchOrCreateRecord();
  }, [consultationId]);
  
  const fetchOrCreateRecord = async () => {
    try {
      setLoading(true);
      // First try to get existing record
      try {
        const response = await consultationRecordApi.getRecordByRoomId(roomId);
        setRecord(response.data);
        setConsultationNotes(response.data.consultation_notes || '');
      } catch (error) {
        // If no record exists, create one
        const response = await consultationRecordApi.startConsultation(consultationId);
        setRecord(response.data);
        setConsultationNotes(response.data.consultation_notes || '');
      }
    } catch (error) {
      console.error('Failed to fetch or create consultation record:', error);
      toast.error('Failed to initialize consultation record');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveNotes = async () => {
    if (!record) return;
    
    try {
      setIsEditingNotes(false);
      await consultationRecordApi.updateConsultationNotes(record.id, consultationNotes);
      toast.success('Notes saved successfully');
    } catch (error) {
      console.error('Failed to save consultation notes:', error);
      toast.error('Failed to save notes');
    }
  };
  
  const handleCompleteConsultation = async (data: {
    diagnosis: string;
    prescribedMedications: PrescribedMedication[];
    treatmentPlan: string;
    postConsultationNotes: string;
    requiresFollowup: boolean;
    followupDate?: string;
    followupNotes?: string;
  }) => {
    if (!record) return;
    
    try {
      await consultationRecordApi.completeConsultation(record.id, {
        diagnosis: data.diagnosis,
        prescribed_medications: data.prescribedMedications,
        treatment_plan: data.treatmentPlan,
        post_consultation_notes: data.postConsultationNotes,
        requires_followup: data.requiresFollowup,
        followup_date: data.followupDate,
        followup_notes: data.followupNotes
      });
      
      toast.success('Consultation completed successfully');
      setShowCompleteModal(false);
      
      // Upload attachment if selected
      if (selectedFile) {
        await handleUploadAttachment();
      }
      
      // Refresh the record
      fetchOrCreateRecord();
    } catch (error) {
      console.error('Failed to complete consultation:', error);
      toast.error('Failed to complete consultation');
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUploadAttachment = async () => {
    if (!record || !selectedFile) return;
    
    try {
      setUploading(true);
      await consultationRecordApi.uploadAttachment(record.id, selectedFile);
      toast.success('File uploaded successfully');
      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold">Consultation Record</h2>
          <div className="mt-1 text-sm text-gray-600">
            <span className="inline-flex items-center">
              <User className="h-4 w-4 mr-1" />
              Patient: {patientName}
            </span>
            <span className="mx-2">•</span>
            <span className="inline-flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {date}
            </span>
            <span className="mx-2">•</span>
            <span className="inline-flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {startTime} - {endTime}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCompleteModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-1" /> Complete Consultation
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Consultation Notes</h3>
              {!isEditingNotes ? (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-blue-600 flex items-center text-sm"
                >
                  <PencilLine className="h-4 w-4 mr-1" /> Edit Notes
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  className="text-green-600 flex items-center text-sm"
                >
                  <Save className="h-4 w-4 mr-1" /> Save Notes
                </button>
              )}
            </div>
            
            {isEditingNotes ? (
              <textarea
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                className="w-full border rounded p-3 h-64 font-mono text-sm"
                placeholder="Enter consultation notes here..."
              />
            ) : (
              <div className="border rounded p-4 min-h-[200px] whitespace-pre-wrap">
                {consultationNotes || <span className="text-gray-400">No notes entered yet.</span>}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Attachments</h3>
            <div className="border rounded p-4">
              <div className="mb-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </label>
                
                {selectedFile && (
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{selectedFile.name}</span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {selectedFile && (
                <button
                  onClick={handleUploadAttachment}
                  disabled={uploading}
                  className={`px-3 py-1 bg-blue-600 text-white rounded text-sm flex items-center ${
                    uploading ? 'opacity-50' : 'hover:bg-blue-700'
                  }`}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              )}
              
              {/* Display list of attachments here if your API supports retrieving them */}
            </div>
          </div>
        </div>
      )}
      
      <AnimatePresence>
        {showCompleteModal && record && (
          <CompleteConsultationModal
            record={record}
            onClose={() => setShowCompleteModal(false)}
            onComplete={handleCompleteConsultation}
          />
        )}
      </AnimatePresence>
    </div>
  );
}