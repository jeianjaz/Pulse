"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Video, Users, Bell, User, 
  Clock, Activity, FileText, Heart, Phone,
  Pill, Stethoscope, LineChart, ClipboardList,
  CalendarClock, LogOut, Lock, Eye, EyeOff, Star
} from 'lucide-react';

import axios from 'axios';
import { getCsrfToken } from '@/utils/csrf';
import { logout as localLogout } from '@/utils/auth';
import { useAuth } from '@/contexts/AuthContext'; // Add this import
import toast, { Toaster } from 'react-hot-toast';

interface PatientInfo {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  date_of_birth: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'event' | 'consultation' | 'general';
  read: boolean;
  created_at: string;
}

interface HealthMetric {
  id: number;
  type: string;
  value: number;
  unit: string;
  date: string;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string;
}

interface Appointment {
  id: number;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

function Patient() {
  const router = useRouter();
  const { logout: authLogout } = useAuth(); // Add this line to get the logout function from AuthContext
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [upcomingConsultations, setUpcomingConsultations] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userName, setUserName] = useState('Patient');

  useEffect(() => {
    // Safely access localStorage after component has mounted
    if (typeof window !== 'undefined') {
      const firstName = localStorage.getItem('first_name');
      if (firstName) {
        setUserName(firstName);
      }
    }
    
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchPatientInfo(),
          fetchNotifications(),
          fetchUpcomingEvents(),
          fetchUpcomingConsultations(),
          fetchHealthMetrics(),
          fetchMedications(),
          fetchAppointments()
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const fetchPatientInfo = async () => {
    // try {
    //   const response = await axios.get(
    //     `${process.env.NEXT_PUBLIC_API_URL}/api/patient/profile/`,
    //     {
    //       headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //       }
    //     }
    //   );
    //   setPatientInfo(response.data);
    // } catch (error) {
    //   console.error('Error fetching patient info:', error);
    // }
  };

  const fetchNotifications = async () => {
    // try {
    //   const response = await axios.get(
    //     `${process.env.NEXT_PUBLIC_API_URL}/api/patient/notifications/`,
    //     {
    //       headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //       }
    //     }
    //   );
    //   setNotifications(response.data.notifications);
    // } catch (error) {
    //   console.error('Error fetching notifications:', error);
    // }
  };

  const fetchUpcomingEvents = async () => {
    // try {
    //   const response = await axios.get(
    //     `${process.env.NEXT_PUBLIC_API_URL}/api/patient/upcoming-events/`,
    //     {
    //       headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //       }
    //     }
    //   );
    //   setUpcomingEvents(response.data.events);
    // } catch (error) {
    //   console.error('Error fetching upcoming events:', error);
    // }
  };

  const fetchUpcomingConsultations = async () => {
    // try {
    //   const response = await axios.get(
    //     `${process.env.NEXT_PUBLIC_API_URL}/api/patient/upcoming-consultations/`,
    //     {
    //       headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //       }
    //     }
    //   );
    //   setUpcomingConsultations(response.data.consultations);
    // } catch (error) {
    //   console.error('Error fetching upcoming consultations:', error);
    // }
  };

  const fetchHealthMetrics = async () => {
    // try {
    //   const response = await axios.get(
    //     `${process.env.NEXT_PUBLIC_API_URL}/api/patient/health-metrics/`,
    //     {
    //       headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //       }
    //     }
    //   );
    //   setHealthMetrics(response.data.metrics);
    // } catch (error) {
    //   console.error('Error fetching health metrics:', error);
    // }
  };

  const fetchMedications = async () => {
    // try {
    //   const response = await axios.get(
    //     `${process.env.NEXT_PUBLIC_API_URL}/api/patient/medications/`,
    //     {
    //       headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //       }
    //     }
    //   );
    //   setMedications(response.data.medications);
    // } catch (error) {
    //   console.error('Error fetching medications:', error);
    // }
  };

  const fetchAppointments = async () => {
    // try {
    //   const response = await axios.get(
    //     `${process.env.NEXT_PUBLIC_API_URL}/api/patient/appointments/`,
    //     {
    //       headers: {
    //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //       }
    //     }
    //   );
    //   setAppointments(response.data.appointments);
    // } catch (error) {
    //   console.error('Error fetching appointments:', error);
    // }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      // Use the AuthContext logout function instead
      await authLogout();
      // Safely clear local storage items
      if (typeof window !== 'undefined') {
        localStorage.removeItem('first_name')
        localStorage.removeItem('last_name')
      }
      router.push('/patient/login');
    } catch (error) {
      console.error('Error logging out:', error);
      // Fallback to local logout if AuthContext logout fails
      try {
        await localLogout();
      } catch (err) {
        console.error('Fallback logout also failed:', err);
      } finally {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('first_name')
          localStorage.removeItem('last_name')
        }
        router.push('/patient/login');
      }
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const quickActions = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Medical Events",
      description: "View and register for upcoming medical events and caravans.",
      href: "/patient/events",
      color: "from-indigo-50 to-indigo-100/50",
      hoverColor: "group-hover:from-indigo-100 group-hover:to-indigo-200/50",
      iconColor: "text-indigo-600",
      borderColor: "hover:border-indigo-300",
      stats: upcomingEvents.length + " Upcoming Events"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Virtual Consultation",
      description: "Schedule and join virtual consultations with healthcare providers.",
      href: "/patient/consultations",
      color: "from-purple-50 to-purple-100/50",
      hoverColor: "group-hover:from-purple-100 group-hover:to-purple-200/50",
      iconColor: "text-purple-600",
      borderColor: "hover:border-purple-300",
      stats: upcomingConsultations.length + " Pending Consultations"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Volunteer Opportunities",
      description: "Find and sign up for volunteer activities in medical events.",
      href: "/patient/volunteer",
      color: "from-cyan-50 to-cyan-100/50",
      hoverColor: "group-hover:from-cyan-100 group-hover:to-cyan-200/50",
      iconColor: "text-cyan-600",
      borderColor: "hover:border-cyan-300",
      stats: "Join Our Community"
    }
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // All the password validations remain the same
    if (!passwordForm.oldPassword) {
      toast.error('Current password is required', {
        style: {
          border: '1px solid #DC2626',
          padding: '16px',
          background: '#FEE2E2',
          color: '#DC2626',
        },
        iconTheme: {
          primary: '#DC2626',
          secondary: '#FEE2E2',
        },
      });
      return;
    }
  
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('All fields are required', {
        style: {
          border: '1px solid #DC2626',
          padding: '16px',
          background: '#FEE2E2',
          color: '#DC2626',
        },
        iconTheme: {
          primary: '#DC2626',
          secondary: '#FEE2E2',
        },
      });
      return;
    }
  
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long', {
        style: {
          border: '1px solid #DC2626',
          padding: '16px',
          background: '#FEE2E2',
          color: '#DC2626',
        },
        iconTheme: {
          primary: '#DC2626',
          secondary: '#FEE2E2',
        },
      });
      return;
    }
  
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      toast.error('New password must contain at least one uppercase letter', {
        style: {
          border: '1px solid #DC2626',
          padding: '16px',
          background: '#FEE2E2',
          color: '#DC2626',
        },
        iconTheme: {
          primary: '#DC2626',
          secondary: '#FEE2E2',
        },
      });
      return;
    }
  
    if (!/[a-z]/.test(passwordForm.newPassword)) {
      toast.error('New password must contain at least one lowercase letter', {
        style: {
          border: '1px solid #DC2626',
          padding: '16px',
          background: '#FEE2E2',
          color: '#DC2626',
        },
        iconTheme: {
          primary: '#DC2626',
          secondary: '#FEE2E2',
        },
      });
      return;
    }
  
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      toast.error('New password must contain at least one number', {
        style: {
          border: '1px solid #DC2626',
          padding: '16px',
          background: '#FEE2E2',
          color: '#DC2626',
        },
        iconTheme: {
          primary: '#DC2626',
          secondary: '#FEE2E2',
        },
      });
      return;
    }
  
    if (!/[!@#$%^&*]/.test(passwordForm.newPassword)) {
      toast.error('New password must contain at least one special character (!@#$%^&*)', {
        style: {
          border: '1px solid #DC2626',
          padding: '16px',
          background: '#FEE2E2',
          color: '#DC2626',
        },
        iconTheme: {
          primary: '#DC2626',
          secondary: '#FEE2E2',
        },
      });
      return;
    }
  
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match', {
        style: {
          border: '1px solid #DC2626',
          padding: '16px',
          background: '#FEE2E2',
          color: '#DC2626',
        },
        iconTheme: {
          primary: '#DC2626',
          secondary: '#FEE2E2',
        },
      });
      return;
    }
  
    if (passwordForm.newPassword === passwordForm.oldPassword) {
      toast.error('New password cannot be the same as the current password', {
        style: {
          border: '1px solid #DC2626',
          padding: '16px',
          background: '#FEE2E2',
          color: '#DC2626',
        },
        iconTheme: {
          primary: '#DC2626',
          secondary: '#FEE2E2',
        },
      });
      return;
    }
    
    try {
      // Updated to use the new API endpoint
      const response = await axios.post(
        `/api/auth/change-password/`,
        {
          old_password: passwordForm.oldPassword,
          new_password: passwordForm.newPassword,
          confirm_password: passwordForm.confirmPassword
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
  
      // Success message
      toast.success('Password changed successfully!', {
        style: {
          border: '1px solid #059669',
          padding: '16px',
          background: '#DCFCE7',
          color: '#059669',
        },
        iconTheme: {
          primary: '#059669',
          secondary: '#DCFCE7',
        },
        duration: 4000,
      });
  
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError('');
      setShowPasswordModal(false);
  
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      
    } catch (error: any) {
      if (error.response) {
        setPasswordError(error.response.data.error || 'Failed to change password');
        toast.error(error.response.data.error || 'Failed to change password', {
          style: {
            border: '1px solid #DC2626',
            padding: '16px',
            background: '#FEE2E2',
            color: '#DC2626',
          },
          iconTheme: {
            primary: '#DC2626',
            secondary: '#FEE2E2',
          },
        });
      } else {
        setPasswordError('An error occurred. Please try again.');
        toast.error('An error occurred. Please try again.', {
          style: {
            border: '1px solid #DC2626',
            padding: '16px',
            background: '#FEE2E2',
            color: '#DC2626',
          },
          iconTheme: {
            primary: '#DC2626',
            secondary: '#FEE2E2',
          },
        });
      }
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-white to-gray-50 relative overflow-hidden"
    >

      <div className="container mx-auto px-6 pt-8 relative z-10">
        {/* Header Section with enhanced animation */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-dm-sans font-bold text-[#1A202C] tracking-tight"
            >
              Welcome, {userName}
            </motion.h1>
            <motion.p 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 mt-2"
            >
              Your Health Dashboard
            </motion.p>
          </div>
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-4"
          >
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => router.push('/patient/manage-profile')}
              >
                <div className="p-1 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <span className="font-medium text-[#1A202C] group-hover:text-blue-600 transition-colors">Manage Profile</span>
              </motion.button>
            </div>
            <motion.button 
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-xl font-bold text-[#1A202C] mb-4">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelLogout}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-[#1A202C]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
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
              className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-[#1A202C] mb-6">Change Password</h3>
              {passwordError && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg font-medium border border-red-400">
                  {passwordError}
                </div>
              )}
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="text-[#1A202C] font-semibold text-base block mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1A202C]" size={20} />
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                      className="pl-12 pr-12 w-full bg-[#F3F3F3] border-2 border-gray-300 focus:border-[#ABF600] focus:ring-[#ABF600] h-12 text-[#1A202C] text-base rounded-lg font-medium placeholder:text-gray-500"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#1A202C] hover:text-gray-700 focus:outline-none"
                    >
                      {showOldPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[#1A202C] font-semibold text-base block mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1A202C]" size={20} />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="pl-12 pr-12 w-full bg-[#F3F3F3] border-2 border-gray-300 focus:border-[#ABF600] focus:ring-[#ABF600] h-12 text-[#1A202C] text-base rounded-lg font-medium placeholder:text-gray-500"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#1A202C] hover:text-gray-700 focus:outline-none"
                    >
                      {showNewPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="mt-3 text-[#1A202C] text-sm font-medium bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="mb-2 font-semibold">Password Requirements:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Minimum 8 characters</li>
                      <li>At least one uppercase letter (A-Z)</li>
                      <li>At least one lowercase letter (a-z)</li>
                      <li>At least one number (0-9)</li>
                      <li>At least one special character (!@#$%^&*)</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <label className="text-[#1A202C] font-semibold text-base block mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1A202C]" size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="pl-12 pr-12 w-full bg-[#F3F3F3] border-2 border-gray-300 focus:border-[#ABF600] focus:ring-[#ABF600] h-12 text-[#1A202C] text-base rounded-lg font-medium placeholder:text-gray-500"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#1A202C] hover:text-gray-700 focus:outline-none"
                    >
                      {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                      setShowOldPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-[#1A202C] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-[#ABF600] hover:bg-[#9DE100] transition-colors text-[#1A202C] font-semibold shadow-lg hover:shadow-xl"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Health Overview Section with enhanced cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-2xl font-dm-sans font-bold text-[#1A202C] mb-4"
          >
            Health Overview
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthMetrics.slice(-3).map(metric => (
              <motion.div
                key={metric.id}
                variants={itemVariants}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#ABF600]/20 rounded-lg">
                      <LineChart className="w-5 h-5 text-[#1A202C]" />
                    </div>
                    <h3 className="font-semibold text-[#1A202C]">{metric.type}</h3>
                  </div>
                  <span className="text-lg font-bold text-[#1A202C]">{metric.value} {metric.unit}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{new Date(metric.date).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats with enhanced design */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            { icon: <Calendar className="w-6 h-6" />, title: "Upcoming Events", value: upcomingEvents.length },
            { icon: <Video className="w-6 h-6" />, title: "Pending Consultations", value: upcomingConsultations.length },
            { icon: <Bell className="w-6 h-6" />, title: "New Notifications", value: notifications.filter(n => !n.read).length }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-[#ABF600]/20 rounded-lg">
                  {stat.icon}
                </div>
                <h3 className="font-semibold text-[#1A202C]">{stat.title}</h3>
              </div>
              <p className="text-3xl font-bold text-[#1A202C]">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Appointments and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Appointments */}
          <div className="bg-[#F3F3F3] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-dm-sans font-bold text-[#1A202C]">Recent Activity</h2>
              <Clock className="w-6 h-6 text-[#1A202C]" />
            </div>
            <div className="space-y-4">
              {upcomingEvents.slice(0, 3).map((event: any, index) => (
                <div key={index} className="flex items-start space-x-4 bg-white p-4 rounded-lg">
                  <div className="p-2 bg-[#ABF600]/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-[#1A202C]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#1A202C]">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#F3F3F3] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-dm-sans font-bold text-[#1A202C]">Notifications</h2>
              <Bell className="w-6 h-6 text-[#1A202C]" />
            </div>
            <div className="space-y-4">
              {upcomingEvents.slice(0, 3).map((event: any, index) => (
                <div key={index} className="flex items-start space-x-4 bg-white p-4 rounded-lg">
                  <div className="p-2 bg-[#ABF600]/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-[#1A202C]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#1A202C]">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions with enhanced cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12 bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 rounded-2xl border border-blue-200/50"
        >
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <motion.h2 
                variants={itemVariants}
                className="text-3xl font-dm-sans font-bold text-[#1A202C] mb-2"
              >
                Featured Services
              </motion.h2>
              <p className="text-gray-600">Explore our comprehensive healthcare services designed for you</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quickActions.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden bg-white p-8 rounded-2xl shadow-lg transition-all duration-300 cursor-pointer
                          hover:shadow-2xl border border-gray-100 ${item.borderColor}`}
                onClick={() => window.location.href = item.href}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} ${item.hoverColor} transition-all duration-300`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-xl
                              bg-white shadow-md ${item.iconColor} hover:shadow-lg transition-all duration-300`}
                  >
                    {item.icon}
                  </motion.div>
                  
                  <h3 className="text-2xl font-dm-sans font-bold text-[#1A202C] mb-3">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-base">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-sm font-medium text-gray-600">
                      {item.stats}
                    </span>
                    <motion.span 
                      whileHover={{ x: 5 }}
                      className={`flex items-center text-[#1A202C] font-medium ${item.iconColor.replace('text', 'group-hover:text')} transition-colors duration-300`}
                    >
                      Learn More 
                      <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.span>
                  </div>
                </div>
                
                {/* Enhanced Hover Effect Corner */}
                <div className={`absolute top-0 right-0 w-24 h-24 transform translate-x-12 -translate-y-12
                                bg-gradient-to-br ${item.color} opacity-50 rounded-full
                                group-hover:scale-150 transition-transform duration-500 group-hover:opacity-70`} />
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.main>
  );
}

export default Patient;
