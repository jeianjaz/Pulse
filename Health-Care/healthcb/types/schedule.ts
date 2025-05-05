export interface ConsultationRequest {
  type: string;
  id: string;
  attributes: {
    date: string;
    start_time: string;
    end_time: string;
    symptoms: string;
    duration: string;
    additional_notes: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
    // New medical data fields
    blood_pressure?: string;
    cholesterol?: string;
    glucose?: string;
    // Direct link to schedule
    schedule_id?: string;
    doctor_details: {
      AccountID: number;
      EmployeeID: string;
    };
    relationships: {
      patient: {
        type: string;
        id: string;
        attributes: {
          id: number;
          first_name: string;
          last_name: string;
          email: string;
          contact_number: string;
        }
      };
      doctor: {
        data: {
          type: string;
          id: string;
        }
      };
    };
  };
}

export interface Schedule {
  id: string;
  attributes: {
    date: string;
    start_time: string;
    end_time: string;
    status: 'available' | 'booked' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    consultation_request_id?: string; // Link back to request
    created_at?: string;
    updated_at?: string;
    room?: string;
    doctor: {
      id: string;
      attributes: {
        name: string;
        position: string;
      }
    };
    patient?: {
      id: string;
      attributes: {
        name: string;
      }
    };
  };
}

export interface ConsultationRecord {
  id: string;
  attributes: {
    diagnosis: string;
    prescribed_medications: string;
    treatment_plan: string;
    post_consultation_notes: string;
    requires_followup: boolean;
    followup_date: string | null;
    followup_notes: string | null;
    consultation_notes: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    consultation: {
      data: {
        id: string;
        type: string;
      }
    }
  };
}

export interface ConsultationDetail {
  id: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  doctor: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    specialization?: string;
  };
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  reason: string;
  symptoms: string | Record<string, string | boolean>;
  additional_notes: string;
  record_id?: string;
  room?: string;
  created_at: string;
  updated_at: string;
}