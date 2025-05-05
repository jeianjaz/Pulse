"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ChevronLeft, Lock, Eye, EyeOff, Save, Edit, 
  Calendar, Phone, Mail, MapPin, Heart, Award, 
  AlertTriangle, CheckCircle
} from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Define types
interface UserProfile {
  first_name: string;
  last_name: string;
  middle_name?: string;
  suffix?: string;
  date_of_birth: string;
  email: string;
  contact_number: string;
  house_number?: string;
  street_name?: string;
  gender?: string;
  // Patient specific fields
  blood_type?: string;
  medical_history?: string;
  emergency_contact?: string;
}

const ManageProfile = () => {
  const router = useRouter();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  // Add state to track original profile data
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    date_of_birth: '',
    email: '',
    contact_number: '',
    house_number: '',
    street_name: '',
    gender: '',
    blood_type: '',
    medical_history: '',
    emergency_contact: ''
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animation variants
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
        stiffness: 100,
        damping: 15
      }
    }
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Use the same endpoint as the doctor implementation
        const response = await axios.get('/api/auth/update-profile/', {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        // Fix the data access path to correctly handle the nested response structure
        const profileData = response.data.data.data.attributes;
        
        // Ensure no null values - replace nulls with empty strings or appropriate defaults
        const sanitizedProfile = {
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          middle_name: profileData.middle_name || '',
          suffix: profileData.suffix || '',
          date_of_birth: profileData.date_of_birth || '',
          email: profileData.email || '',
          contact_number: profileData.contact_number || '',
          house_number: profileData.house_number || '',
          street_name: profileData.street_name || '',
          gender: profileData.gender || '',
          blood_type: profileData.blood_type || '',
          medical_history: profileData.medical_history || '',
          emergency_contact: profileData.emergency_contact || ''
        };
        
        setUserProfile(sanitizedProfile);
        // Store the original profile for comparison later
        setOriginalProfile(JSON.parse(JSON.stringify(sanitizedProfile)));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // For demo purposes - remove in production
        const demoProfile = {
          first_name: localStorage.getItem('first_name') || 'John',
          last_name: localStorage.getItem('last_name') || 'Doe',
          middle_name: '',
          suffix: '',
          date_of_birth: '1990-01-01',
          email: 'user@example.com',
          contact_number: '1234567890',
          house_number: '123',
          street_name: 'Main St',
          gender: 'M',
          blood_type: 'O+',
          medical_history: 'No significant medical history',
          emergency_contact: 'Jane Doe (123-456-7890)'
        };
        
        setUserProfile(demoProfile);
        // Store the demo profile as original
        setOriginalProfile(JSON.parse(JSON.stringify(demoProfile)));
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for date of birth
    if (name === 'date_of_birth' && value) {
      // Calculate age based on selected date
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Validate minimum age (18 years) and future dates
      if (birthDate > today) {
        setProfileError('Birth date cannot be in the future');
        return;
      }
      
      if (age < 18) {
        setProfileError('You must be at least 18 years old to use this platform');
        return;
      }
      
      // Clear any previous error if valid
      if (profileError.includes('Birth date') || profileError.includes('years old')) {
        setProfileError('');
      }
    }
    
    // Ensure we never set null values, use empty string or appropriate defaults
    const sanitizedValue = value === null 
      ? (typeof userProfile[name as keyof UserProfile] === 'number' ? 0 : '')
      : value;
    
    setUserProfile(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setProfileError('');
      
      if (!originalProfile) {
        throw new Error('Original profile data is missing');
      }

      // Validate date of birth before saving
      if (userProfile.date_of_birth) {
        const birthDate = new Date(userProfile.date_of_birth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (birthDate > today) {
          setProfileError('Birth date cannot be in the future');
          setSaving(false);
          return;
        }
        
        if (age < 18) {
          setProfileError('You must be at least 18 years old to use this platform');
          setSaving(false);
          return;
        }
      }
      
      // Compare current profile with original to find changed fields
      const changedFields: Partial<UserProfile> = {};
      let hasChanges = false;
      
      // Loop through current profile and check if values differ from original
      Object.keys(userProfile).forEach(key => {
        const typedKey = key as keyof UserProfile;
        const currentValue = userProfile[typedKey];
        const originalValue = originalProfile[typedKey];
        
        // Only include fields that have changed
        if (currentValue !== originalValue) {
          // Special handling for date_of_birth - ensure valid format or don't include
          if (typedKey === 'date_of_birth') {
            if (currentValue) {
              // Validate date format (YYYY-MM-DD)
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
              if (!dateRegex.test(currentValue as string)) {
                throw new Error('Date of birth must be in format YYYY-MM-DD');
              }
              changedFields[typedKey] = currentValue;
            }
          } else {
            changedFields[typedKey] = currentValue;
            hasChanges = true;
          }
        }
      });
      
      // Only proceed if there are changes
      if (!hasChanges && Object.keys(changedFields).length === 0) {
        toast.info('No changes detected');
        setSaving(false);
        setEditMode(false);
        return;
      }
      
      // Send only changed fields to API
      const response = await axios.put(
        '/api/auth/update-profile/',
        changedFields,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      // Update original profile with new values
      setOriginalProfile({...originalProfile, ...changedFields});
      
      // Success handling
      setProfileSuccess('Profile updated successfully');
      toast.success('Profile updated successfully', {
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
      
      // Exit edit mode
      setEditMode(false);
      
      // Clear success message after delay
      setTimeout(() => {
        setProfileSuccess('');
      }, 5000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // Handle specific validation errors
      if (error.message && error.message.includes('Date of birth')) {
        setProfileError(error.message);
      } else if (error.response) {
        setProfileError(error.response.data.error || 'Failed to update profile');
      } else {
        setProfileError(error.message || 'An error occurred. Please try again.');
      }
      
      toast.error(profileError || 'Failed to update profile', {
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
    } finally {
      setSaving(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    // Validation
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      setPasswordError('New password must contain at least one uppercase letter');
      return;
    }
    
    if (!/[a-z]/.test(passwordForm.newPassword)) {
      setPasswordError('New password must contain at least one lowercase letter');
      return;
    }
    
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordError('New password must contain at least one number');
      return;
    }
    
    if (!/[!@#$%^&*]/.test(passwordForm.newPassword)) {
      setPasswordError('New password must contain at least one special character (!@#$%^&*)');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }
    
    if (passwordForm.newPassword === passwordForm.oldPassword) {
      setPasswordError('New password cannot be the same as the current password');
      return;
    }
    
    try {
      setSaving(true);
      // Updated to use the correct API endpoint
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
      
      // Reset form and state
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.response) {
        setPasswordError(error.response.data.error || 'Failed to change password');
      } else {
        setPasswordError('An error occurred. Please try again.');
      }
      
      toast.error(passwordError || 'Failed to change password', {
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
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#ABF600]"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-12 px-6"
    >
      <Toaster position="bottom-right" />
      
      {/* Back button and header */}
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <button 
            onClick={() => router.push('/patient')}
            className="flex items-center text-gray-600 hover:text-[#1A202C] mb-6 group"
          >
            <ChevronLeft className="w-5 h-5 mr-2 group-hover:mr-3 transition-all" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-4xl font-bold text-[#1A202C] mb-6">Manage Your Profile</h1>
          <p className="text-gray-600 mb-10">View and update your information and account settings</p>
        </motion.div>
        
        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-8 font-semibold transition-all ${
                activeTab === 'profile' 
                ? 'text-[#1A202C] border-b-2 border-[#ABF600]' 
                : 'text-gray-500 hover:text-[#1A202C]'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-8 font-semibold transition-all ${
                activeTab === 'password' 
                ? 'text-[#1A202C] border-b-2 border-[#ABF600]' 
                : 'text-gray-500 hover:text-[#1A202C]'
              }`}
            >
              Change Password
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#1A202C]">
                    {editMode ? 'Edit Profile' : 'Profile Information'}
                  </h2>
                  
                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-[#ABF600] text-[#1A202C] font-semibold rounded-lg shadow-md hover:bg-[#9DE100] transition-all"
                    >
                      <Edit className="w-5 h-5 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                {profileError && (
                  <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {profileError}
                  </div>
                )}
                
                {profileSuccess && (
                  <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {profileSuccess}
                  </div>
                )}
                
                <form onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Personal Information Section */}
                    <div className="col-span-2">
                      <h3 className="text-lg font-bold text-[#1A202C] mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Personal Information
                      </h3>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              First Name
                            </label>
                            {editMode ? (
                              <input
                                type="text"
                                name="first_name"
                                value={userProfile.first_name}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              />
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.first_name}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Middle Name (Optional)
                            </label>
                            {editMode ? (
                              <input
                                type="text"
                                name="middle_name"
                                value={userProfile.middle_name || ''}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              />
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.middle_name || 'N/A'}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name
                            </label>
                            {editMode ? (
                              <input
                                type="text"
                                name="last_name"
                                value={userProfile.last_name}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              />
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.last_name}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Suffix (Optional)
                            </label>
                            {editMode ? (
                              <input
                                type="text"
                                name="suffix"
                                value={userProfile.suffix || ''}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              />
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.suffix || 'N/A'}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Gender
                            </label>
                            {editMode ? (
                              <select
                                name="gender"
                                value={userProfile.gender || ''}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.gender || 'Not specified'}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date of Birth
                            </label>
                            {editMode ? (
                              <input
                                type="date"
                                name="date_of_birth"
                                value={userProfile.date_of_birth}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              />
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.date_of_birth ? new Date(userProfile.date_of_birth).toLocaleDateString() : 'Not specified'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Contact Information Section */}
                    <div className="col-span-2">
                      <h3 className="text-lg font-bold text-[#1A202C] mb-4 flex items-center">
                        <Phone className="w-5 h-5 mr-2" />
                        Contact Information
                      </h3>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address
                            </label>
                            {editMode ? (
                              <input
                                type="email"
                                name="email"
                                value={userProfile.email}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              />
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.email}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number
                            </label>
                            {editMode ? (
                              <input
                                type="tel"
                                name="contact_number"
                                value={userProfile.contact_number}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              />
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.contact_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Address Information Section */}
                    <div className="col-span-2">
                      <h3 className="text-lg font-bold text-[#1A202C] mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Address Information
                      </h3>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              House/Unit Number
                            </label>
                            {editMode ? (
                              <input
                                type="text"
                                name="house_number"
                                value={userProfile.house_number || ''}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              />
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.house_number || 'Not specified'}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Street Name
                            </label>
                            {editMode ? (
                              <input
                                type="text"
                                name="street_name"
                                value={userProfile.street_name || ''}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              />
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.street_name || 'Not specified'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Medical Information Section (Patient-specific) */}
                    <div className="col-span-2">
                      <h3 className="text-lg font-bold text-[#1A202C] mb-4 flex items-center">
                        <Heart className="w-5 h-5 mr-2" />
                        Medical Information
                      </h3>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Blood Type
                            </label>
                            {editMode ? (
                              <select
                                name="blood_type"
                                value={userProfile.blood_type || ''}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                              >
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                              </select>
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.blood_type || 'Not specified'}
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Emergency Contact
                            </label>
                            {editMode ? (
                              <input
                                type="text"
                                name="emergency_contact"
                                value={userProfile.emergency_contact || ''}
                                onChange={handleProfileChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent"
                                placeholder="Name & Phone Number"
                              />
                            ) : (
                              <p className="p-3 bg-white border border-gray-200 rounded-lg">
                                {userProfile.emergency_contact || 'Not specified'}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Medical History
                          </label>
                          {editMode ? (
                            <textarea
                              name="medical_history"
                              value={userProfile.medical_history || ''}
                              onChange={handleProfileChange}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ABF600] focus:border-transparent min-h-[100px]"
                              placeholder="Include allergies, chronic conditions, etc."
                            />
                          ) : (
                            <p className="p-3 bg-white border border-gray-200 rounded-lg min-h-[80px]">
                              {userProfile.medical_history || 'No medical history recorded'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {editMode && (
                    <div className="flex justify-end mt-6">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 px-6 py-3 bg-[#ABF600] text-[#1A202C] font-semibold rounded-lg shadow-md hover:bg-[#9DE100] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <span className="flex items-center">
                            <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-[#1A202C] rounded-full"></span>
                            Saving...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Save className="w-5 h-5 mr-2" />
                            Save Changes
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </motion.div>
            )}
            
            {/* Password Change Tab */}
            {activeTab === 'password' && (
              <motion.div
                key="password"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#1A202C] mb-4">Change Your Password</h2>
                  <p className="text-gray-600">
                    Update your password to keep your account secure.
                  </p>
                </div>
                
                {passwordError && (
                  <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
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
                  
                  <div className="flex justify-end mt-8">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2 px-6 py-3 bg-[#ABF600] text-[#1A202C] font-semibold rounded-lg shadow-md hover:bg-[#9DE100] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-[#1A202C] rounded-full"></span>
                          Updating Password...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Lock className="w-5 h-5 mr-2" />
                          Change Password
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Additional security information */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-start">
            <Award className="w-6 h-6 text-[#ABF600] mr-4 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-[#1A202C] mb-2">Account Security Tips</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Never share your password with anyone, including support staff</li>
                <li>• Use a unique password that you don't use for other accounts</li>
                <li>• Enable two-factor authentication for additional security</li>
                <li>• Check your account activity regularly for any unauthorized access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageProfile;