import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { consultationApi } from '@/services/consultationApi';
import { Spinner } from '@/components/ui/spinner'; // Assuming you have a spinner component
import { Alert, AlertDescription } from '@/components/ui/alert'; // Assuming you have alert components

interface NoteTakingProps {
  recordId: string;
  initialNotes?: string;
}

export default function NoteTaking({ recordId, initialNotes }: NoteTakingProps) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [loading, setLoading] = useState(!initialNotes);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  const debouncedSave = useCallback(
    debounce(async (value: string) => {
      if (!recordId) return;
      
      try {
        setSaveStatus('saving');
        await consultationApi.updateConsultationNotes(recordId, {
          consultation_notes: value
        });
        setSaveStatus('saved');
        // Reset the save status after a delay
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to save notes:', error);
        setSaveStatus('failed');
      }
    }, 1000),
    [recordId]
  );

  useEffect(() => {
    // Skip fetch if initialNotes was provided
    if (initialNotes !== undefined) {
      return;
    }
    
    const fetchNotes = async () => {
      if (!recordId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await consultationApi.getRecordByRoomId(recordId);
        console.log('Consultation record retrieved:', response);
        
        // Updated to match the actual API response structure
        if (response && response.data && response.data.data) {
          // Check for record.consultation_notes first (original format)
          if (response.data.data.record && response.data.data.record.consultation_notes !== undefined) {
            setNotes(response.data.data.record.consultation_notes || '');
          } 
          // Fallback to attributes format if present
          else if (response.data.data.attributes && response.data.data.attributes.consultation_notes !== undefined) {
            setNotes(response.data.data.attributes.consultation_notes || '');
          } 
          // Last resort - directly check for consultation_notes
          else if (response.data.data.consultation_notes !== undefined) {
            setNotes(response.data.data.consultation_notes || '');
          }
          else {
            // No recognized format found
            console.warn('Could not find consultation_notes in response:', response.data);
            setNotes('');
          }
        } else {
          // Handle unexpected data structure
          console.warn('Unexpected data structure from API:', response);
          // Set default empty notes so we can still use the component
          setNotes('');
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        setError('Unable to load consultation notes. The consultation record may not exist yet.');
        // Keep empty notes so the component can still be used
        setNotes('');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, [recordId, initialNotes]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNotes(newValue);
    debouncedSave(newValue);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#1A202C]">Consultation Notes</h3>
        {saveStatus === 'saving' && <span className="text-sm text-gray-500">Saving...</span>}
        {saveStatus === 'saved' && <span className="text-sm text-green-500">Saved</span>}
        {saveStatus === 'failed' && <span className="text-sm text-red-500">Failed to save</span>}
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <textarea
        value={notes}
        onChange={handleNotesChange}
        className="w-full h-64 p-3 border rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
        placeholder="Enter consultation notes here..."
      />
    </div>
  );
}
