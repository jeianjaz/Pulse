// ./app/patient-registration/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  UserPlus, User, Mail, Lock, Phone, 
  Calendar, Home, MapPin, AlertCircle, Eye, EyeOff 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackgroundElements from "@/components/BackgroundElements";
import axios from 'axios';

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password: string) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const isLongEnough = password.length >= 8;

  return {
    isValid: hasUpperCase && hasLowerCase && hasNumbers && isLongEnough,
    errors: [
      !isLongEnough && "Password must be at least 8 characters",
      !hasUpperCase && "Password must contain an uppercase letter",
      !hasLowerCase && "Password must contain a lowercase letter",
      !hasNumbers && "Password must contain a number"
    ].filter(Boolean)
  };
};

const validatePhoneNumber = (phone: string) => {
  const re = /^(09|\+639)\d{9}$/;
  return re.test(phone);
};

const validateUsername = (username: string) => {
  const minLength = 3;
  const maxLength = 20;
  const validChars = /^[a-zA-Z0-9_]+$/;
  
  if (username.length < minLength) return `Username must be at least ${minLength} characters`;
  if (username.length > maxLength) return `Username cannot exceed ${maxLength} characters`;
  if (!validChars.test(username)) return "Username can only contain letters, numbers, and underscores";
  return "";
};

const validateName = (name: string, fieldName: string) => {
  const validName = /^[a-zA-Z\s-']+$/;
  if (!name.trim()) return `${fieldName} is required`;
  if (!validName.test(name)) return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  if (name.length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.length > 50) return `${fieldName} cannot exceed 50 characters`;
  return "";
};

const validateDateOfBirth = (dob: string) => {
  if (!dob) return "Date of birth is required";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 0) return "Invalid date of birth";
  if (age < 18) return "You must be at least 18 years old";
  if (age > 120) return "Please enter a valid date of birth";
  return "";
};

const validateAddress = (value: string, fieldName: string) => {
  if (!value.trim()) return `${fieldName} is required`;
  if (value.length < 1) return `${fieldName} is too short`;
  if (value.length > 100) return `${fieldName} cannot exceed 100 characters`;
  return "";
};

export default function PatientRegistrationPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    contact_number: "",
    house_number: "",
    street_name: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    let fieldError = "";
    switch (name) {
      case "username":
        fieldError = validateUsername(value);
        break;
      case "email":
        fieldError = !value.trim() ? "Email is required" : !validateEmail(value) ? "Invalid email format" : "";
        break;
      case "password":
        const passwordValidation = validatePassword(value);
        fieldError = !passwordValidation.isValid ? passwordValidation.errors[0] || "Invalid password" : "";
        // Also validate confirm password if it exists
        if (formData.confirm_password && value !== formData.confirm_password) {
          setErrors(prev => ({
            ...prev,
            confirm_password: "Passwords do not match"
          }));
        }
        break;
      case "confirm_password":
        fieldError = !value ? "Please confirm your password" : 
                    value !== formData.password ? "Passwords do not match" : "";
        break;
      case "first_name":
      case "last_name":
        fieldError = validateName(value, name === "first_name" ? "First name" : "Last name");
        break;
      case "middle_name":
        if (value.trim()) { // Only validate if middle name is provided (optional)
          fieldError = validateName(value, "Middle name");
        }
        break;
      case "date_of_birth":
        fieldError = validateDateOfBirth(value);
        break;
      case "contact_number":
        fieldError = !value.trim() ? "Contact number is required" : 
                    !validatePhoneNumber(value) ? "Invalid phone number format (e.g., 09XXXXXXXXX or +639XXXXXXXXX)" : "";
        break;
      case "house_number":
        fieldError = validateAddress(value, "House number");
        break;
      case "street_name":
        fieldError = validateAddress(value, "Street name");
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: fieldError || undefined
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Username validation
    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;
    
    // Email validation
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0] || "Invalid password";
      }
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }
    
    // Name validations
    const firstNameError = validateName(formData.first_name, "First name");
    if (firstNameError) newErrors.first_name = firstNameError;
    
    const lastNameError = validateName(formData.last_name, "Last name");
    if (lastNameError) newErrors.last_name = lastNameError;
    
    if (formData.middle_name.trim()) {
      const middleNameError = validateName(formData.middle_name, "Middle name");
      if (middleNameError) newErrors.middle_name = middleNameError;
    }
    
    // Date of birth validation
    const dobError = validateDateOfBirth(formData.date_of_birth);
    if (dobError) newErrors.date_of_birth = dobError;
    
    // Contact number validation
    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Contact number is required";
    } else if (!validatePhoneNumber(formData.contact_number)) {
      newErrors.contact_number = "Invalid phone number format (e.g., 09XXXXXXXXX or +639XXXXXXXXX)";
    }

    // Address validations
    const houseNumberError = validateAddress(formData.house_number, "House number");
    if (houseNumberError) newErrors.house_number = houseNumberError;
    
    const streetNameError = validateAddress(formData.street_name, "Street name");
    if (streetNameError) newErrors.street_name = streetNameError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `/api/register/`, 
        {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          contact_number: formData.contact_number,
          house_number: formData.house_number,
          street_name: formData.street_name
        }
      );

      const { status, message, username } = response.data.data;

      switch (status) {
        case 'VERIFICATION_REQUIRED':
          router.push(`/patient/residency-verification?username=${username || formData.username}`);
          break;
        case 'SUCCESS':
          router.push('/patient/login');
          break;
        default:
          setErrors({
            submit: message || "Registration failed"
          });
      }
    } catch (err: any) {
      setErrors({
        submit: err.response?.data?.message || "An error occurred during registration"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF] relative overflow-hidden">
      <BackgroundElements />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-4xl mx-auto"
        >
          <div className="p-8">
            <div className="text-center mb-8">
              <UserPlus className="mx-auto w-16 h-16 text-[#ABF600] mb-4" />
              <h2 className="text-3xl font-bold text-[#1A202C]">Patient Registration</h2>
              <p className="text-[#1A202C]/70 mt-2">Create your patient account</p>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              {/* Account Details Column */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#1A202C] border-b pb-2">Account Details</h3>
                
                {/* Username Input */}
                <div className="relative">
                  <Label className="text-[#1A202C]">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                    <Input 
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      className="pl-10"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                  )}
                </div>

                {/* Email Input */}
                <div className="relative">
                  <Label className="text-[#1A202C]">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                    <Input 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email address"
                      className="pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Label className="text-[#1A202C]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                  <Label className="text-[#1A202C]">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>
                  )}
                </div>
              </div>

              {/* Personal Details Column */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#1A202C] border-b pb-2">Personal Information</h3>
                
                {/* First Name Input */}
                <div className="relative">
                  <Label className="text-[#1A202C]">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                    <Input 
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Your first name"
                      className="pl-10"
                    />
                  </div>
                  {errors.first_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
                  )}
                </div>

                {/* Middle Name (Optional) Input */}
                <div className="relative">
                  <Label className="text-[#1A202C]">Middle Name (Optional)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                    <Input 
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleChange}
                      placeholder="Your middle name"
                      className="pl-10"
                    />
                  </div>
                  {errors.middle_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.middle_name}</p>
                  )}
                </div>

                {/* Last Name Input */}
                <div className="relative">
                  <Label className="text-[#1A202C]">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                    <Input 
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Your last name"
                      className="pl-10"
                    />
                  </div>
                  {errors.last_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
                  )}
                </div>

                {/* Date of Birth Input */}
                <div className="relative">
                  <Label className="text-[#1A202C]">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C] pointer-events-none z-10" />
                    <Input 
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="pl-10 text-gray-900"
                      style={{ colorScheme: 'light' }}
                    />
                  </div>
                  {errors.date_of_birth && (
                    <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>
                  )}
                </div>

                {/* Contact Number Input */}
                <div className="relative">
                  <Label className="text-[#1A202C]">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                    <Input 
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      placeholder="Your contact number"
                      className="pl-10"
                    />
                  </div>
                  {errors.contact_number && (
                    <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>
                  )}
                </div>
              </div>

              {/* Full Width Address Section */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xl font-semibold text-[#1A202C] border-b pb-2">Address</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* House Number */}
                  <div className="relative">
                    <Label className="text-[#1A202C]">House Number</Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                      <Input 
                        name="house_number"
                        value={formData.house_number}
                        onChange={handleChange}
                        placeholder="House number"
                        className="pl-10"
                      />
                    </div>
                    {errors.house_number && (
                      <p className="text-red-500 text-xs mt-1">{errors.house_number}</p>
                    )}
                  </div>

                  {/* Street Name */}
                  <div className="relative">
                    <Label className="text-[#1A202C]">Street Name</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                      <Input 
                        name="street_name"
                        value={formData.street_name}
                        onChange={handleChange}
                        placeholder="Street name"
                        className="pl-10"
                      />
                    </div>
                    {errors.street_name && (
                      <p className="text-red-500 text-xs mt-1">{errors.street_name}</p>
                    )}
                  </div>
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
                    <AlertCircle className="mr-2 text-red-500" />
                    <span className="block sm:inline">{errors.submit}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 flex justify-center mt-6">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full max-w-md bg-[#ABF600] text-black hover:bg-[#ABF600]/90 transition-colors duration-300 ease-in-out"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg 
                        className="animate-spin h-5 w-5 mr-3" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        ></circle>
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>                      Registering...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>

              {/* Login Link */}
              <div className="md:col-span-2 text-center mt-4">
                <p className="text-[#1A202C]/70">
                  Already have an account? 
                  <Link 
                    href="/patient/login" 
                    className="text-[#ABF600] font-semibold hover:underline ml-1"
                  > 
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}