// API Models following the Healthcare API Documentation

// User Models
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'doctor' | 'patient' | 'admin';
}

export interface DoctorProfile {
  user: number;
  specialization: string;
  license_number: string;
  biography: string;
  years_of_experience: number;
  profile_image?: string;
  available_for_consultation: boolean;
}

export interface PatientProfile {
  user: number;
  date_of_birth: string;
  blood_group?: string;
  allergies?: string;
  medical_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
}

// Availability Models
export interface DoctorAvailability {
  id: number;
  doctor: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'blocked';
  created_at?: string;
  updated_at?: string;
}

export interface RecurringAvailabilityRequest {
  start_date: string;
  end_date: string;
  days_of_week: string[];
  start_time: string;
  end_time: string;
}

export interface BlockTimeRequest {
  start_date: string;
  end_date: string;
  reason: string;
}

// Consultation Request Models
export interface ConsultationRequestModel {
  id: number;
  patient: number;
  doctor: number;
  availability: number;
  reason: string;
  symptoms: string[];
  additional_notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface CreateConsultationRequestPayload {
  availability_id: number;
  reason: string;
  symptoms: string[];
  additional_notes?: string;
}

// Consultation Models
export interface Consultation {
  id: number;
  patient: number;
  doctor: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'canceled';
  room_id?: string;
}

// Consultation Record Models
export interface ConsultationRecordModel {
  id: number;
  consultation: number;
  diagnosis: string;
  treatment_plan: string;
  consultation_notes: string;
  prescribed_medications: PrescribedMedication[];
  requires_followup: boolean;
  followup_date?: string;
  followup_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PrescribedMedication {
  name: string;
  dosage: string;
  frequency: string;
}

// API Responses
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  status?: number;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;