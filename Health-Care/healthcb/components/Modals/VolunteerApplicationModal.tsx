"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, User, Phone, Mail, MapPin, GraduationCap, Clock, Heart } from "lucide-react";
import { registerVolunteer } from '@/services/volunteerService';

interface VolunteerApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    title: string;
    requirements: string[];
  };
}

interface FormErrors {
  [key: string]: string;
}

const VolunteerApplicationModal: React.FC<VolunteerApplicationModalProps> = ({
  isOpen,
  onClose,
  opportunity
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    age: '',
    education: '',
    experience: '',
    availability: '',
    motivation: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Name validation - only letters and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (!nameRegex.test(formData.fullName)) {
      newErrors.fullName = 'Name can only contain letters and spaces';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation - only numbers
    const phoneRegex = /^\d+$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone number can only contain numbers';
    } else if (formData.phone.length < 10 || formData.phone.length > 11) {
      newErrors.phone = 'Phone number must be 10-11 digits';
    }

    // Age validation
    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(age) || age < 18) {
      newErrors.age = 'You must be 18 or older to volunteer';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Education validation
    if (!formData.education) {
      newErrors.education = 'Please select your education level';
    }

    // Availability validation
    if (!formData.availability) {
      newErrors.availability = 'Please select your availability';
    }

    // Motivation validation
    if (!formData.motivation.trim()) {
      newErrors.motivation = 'Please share your motivation for volunteering';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number - only allow numbers
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^\d]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const payload = {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          age: parseInt(formData.age),
          address: formData.address,
          education: formData.education,
          experience: formData.experience || '',
          availability: formData.availability,
          motivation: formData.motivation,
          opportunity_title: opportunity.title
        };

        const response = await registerVolunteer(payload);
        alert('Thank you for your application! We will contact you soon.');
        onClose();
      } catch (error: any) {
        console.error('Error:', error);
        alert('Error submitting application: ' + (error.message || 'Please try again later'));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-lg">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold text-center text-gray-800">
            Volunteer Application
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            {opportunity.title}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Requirements Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Requirements</h3>
            <ul className="list-disc list-inside space-y-1">
              {opportunity.requirements.map((req, index) => (
                <li key={index} className="text-gray-700">{req}</li>
              ))}
            </ul>
          </div>

          {/* Personal Information */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName" className="text-gray-700">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`pl-10 text-black bg-white ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:border-gray-400 focus:ring-gray-300`}
                    placeholder="ex. Noah"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 text-black bg-white ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-gray-400 focus:ring-gray-300`}
                    placeholder="johndoe@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-700">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={11}
                    className={`pl-10 text-black bg-white ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-gray-400 focus:ring-gray-300`}
                    placeholder="09123456789"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <Label htmlFor="age" className="text-gray-700">Age * (Must be 18+)</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min="18"
                  value={formData.age}
                  onChange={handleChange}
                  className={`text-black bg-white ${errors.age ? 'border-red-500' : 'border-gray-300'} focus:border-gray-400 focus:ring-gray-300`}
                />
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="address" className="text-gray-700">Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`pl-10 text-black bg-white min-h-[80px] ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:border-gray-400 focus:ring-gray-300`}
                  placeholder="Your complete address"
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Qualifications */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-500" />
              Qualifications
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="education" className="text-gray-700">Educational Background *</Label>
                <Select
                  value={formData.education}
                  onValueChange={(value) => handleSelectChange(value, 'education')}
                >
                  <SelectTrigger className={`bg-white text-black h-10 px-3 py-2 ${errors.education ? 'border-red-500' : 'border-gray-300'} hover:border-gray-400`}>
                    <SelectValue placeholder="Select your highest education" className="text-gray-500" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300">
                    <SelectItem value="high-school" className="text-black hover:bg-gray-100">High School</SelectItem>
                    <SelectItem value="bachelors" className="text-black hover:bg-gray-100">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters" className="text-black hover:bg-gray-100">Master's Degree</SelectItem>
                    <SelectItem value="phd" className="text-black hover:bg-gray-100">PhD</SelectItem>
                    <SelectItem value="other" className="text-black hover:bg-gray-100">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.education && (
                  <p className="text-red-500 text-sm mt-1">{errors.education}</p>
                )}
              </div>
              <div>
                <Label htmlFor="experience" className="text-gray-700">Relevant Experience</Label>
                <Textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Please describe any relevant experience..."
                  className="text-black bg-white min-h-[100px] border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Availability & Motivation */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  Availability
                </h3>
                <Label htmlFor="availability" className="text-gray-700">When are you available? *</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) => handleSelectChange(value, 'availability')}
                >
                  <SelectTrigger className={`bg-white text-black h-10 px-3 py-2 ${errors.availability ? 'border-red-500' : 'border-gray-300'} hover:border-gray-400`}>
                    <SelectValue placeholder="Select your availability" className="text-gray-500" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-300">
                    <SelectItem value="weekdays" className="text-black hover:bg-gray-100">Weekdays</SelectItem>
                    <SelectItem value="weekends" className="text-black hover:bg-gray-100">Weekends</SelectItem>
                    <SelectItem value="both" className="text-black hover:bg-gray-100">Both Weekdays and Weekends</SelectItem>
                    <SelectItem value="flexible" className="text-black hover:bg-gray-100">Flexible Schedule</SelectItem>
                  </SelectContent>
                </Select>
                {errors.availability && (
                  <p className="text-red-500 text-sm mt-1">{errors.availability}</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-gray-500" />
                  Motivation
                </h3>
                <Label htmlFor="motivation" className="text-gray-700">Why do you want to volunteer? *</Label>
                <Textarea
                  id="motivation"
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  className={`text-black bg-white min-h-[120px] ${errors.motivation ? 'border-red-500' : 'border-gray-300'} focus:border-gray-400 focus:ring-gray-300`}
                  placeholder="Share why you want to volunteer with us"
                />
                {errors.motivation && (
                  <p className="text-red-500 text-sm mt-1">{errors.motivation}</p>
                )}
              </div>
            </div>
          </div>

          {/* Age Warning */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-gray-600 flex-shrink-0" />
            <p className="text-gray-800 text-sm">
              Please note that only individuals 18 years and older are eligible to volunteer.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gray-800 hover:bg-gray-700 text-white px-6"
            >
              Submit Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VolunteerApplicationModal;
