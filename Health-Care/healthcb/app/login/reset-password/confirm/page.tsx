"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BackgroundElements from "@/components/BackgroundElements";
import axios from "axios";
import { validatePassword } from "@/lib/validation";

export default function PasswordResetConfirm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    email: emailFromUrl,
    reset_code: "",
    password: "",
    confirm_password: ""
  });
  
  // Update the email field if the URL parameter changes
  useEffect(() => {
    if (emailFromUrl) {
      setFormData(prev => ({ ...prev, email: emailFromUrl }));
    }
  }, [emailFromUrl]);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate reset code
      if (formData.reset_code.length !== 6 || !/^\d+$/.test(formData.reset_code)) {
        throw new Error("Reset code must be a 6-digit number");
      }

      // Validate password
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0] || "Invalid password");
      }

      // Check if passwords match
      if (formData.password !== formData.confirm_password) {
        throw new Error("Passwords do not match");
      }

      // Submit the password reset request
      await axios.post("/api/auth/reset-password/confirm/", formData);
      setIsSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      // Handle specific error codes
      if (err.response?.status === 400) {
        setError("Invalid reset code. Please check the code and try again.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <BackgroundElements />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <Link href="/login" className="inline-block mb-8">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-md mx-auto p-8"
        >
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
                <h2 className="text-xl font-bold mb-2">Password Reset Successful!</h2>
                <p>
                  Your password has been reset successfully. You will be redirected to the login page shortly.
                </p>
              </div>
              <Link href="/login">
                <Button className="bg-[#ABF600] text-black hover:bg-[#9DE100]">
                  Go to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#1A202C]">Reset Your Password</h2>
                <p className="text-[#1A202C]/70 mt-2">
                  Enter the code sent to your email along with your new password
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-[#1A202C]">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 border-gray-300 focus:border-[#ABF600] focus:ring-[#ABF600]"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[#1A202C]">Reset Code</Label>
                  <div className="relative mt-1">
                    <Input
                      type="text"
                      name="reset_code"
                      value={formData.reset_code}
                      onChange={handleChange}
                      className="border-gray-300 focus:border-[#ABF600] focus:ring-[#ABF600]"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      required
                      autoFocus={!!emailFromUrl} // Focus on the code field if email is already filled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Password Requirements Info */}
                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    <p className="font-semibold mb-2">Password Requirements:</p>
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
                  <Label className="text-[#1A202C]">New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 border-gray-300 focus:border-[#ABF600] focus:ring-[#ABF600]"
                      placeholder="Create new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label className="text-[#1A202C]">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1A202C]" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className="pl-10 pr-10 border-gray-300 focus:border-[#ABF600] focus:ring-[#ABF600]"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#ABF600] text-black hover:bg-[#9DE100] py-2 h-12 text-base font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <div className="text-center mt-4">
                  <Link
                    href="/login/reset-password/request"
                    className="text-sm text-[#1A202C]/70 hover:text-[#1A202C]"
                  >
                    Didn't receive a code? Request again
                  </Link>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}