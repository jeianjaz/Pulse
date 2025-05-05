"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackgroundElements from "@/components/BackgroundElements";
import axios from "axios";

export default function PasswordResetRequest() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Send the request to generate a reset code
      await axios.post("/api/auth/reset-password/request/", { email });
      
      // Always show success message regardless of whether the email exists
      // This is a security measure to prevent user enumeration
      setIsSubmitted(true);
      
      // After a brief delay, redirect to the confirm page with the email
      setTimeout(() => {
        router.push(`/login/reset-password/confirm?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      // Don't reveal whether the email exists or not
      // Just set a generic error for actual API/network failures
      if (err.response?.status !== 400) {
        setError("Something went wrong. Please try again later.");
      } else {
        // Still proceed to the confirmation page even with a 400 error
        // This keeps the flow consistent and prevents user enumeration
        setIsSubmitted(true);
        setTimeout(() => {
          router.push(`/login/reset-password/confirm?email=${encodeURIComponent(email)}`);
        }, 2000);
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
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
                <h2 className="text-xl font-bold mb-2">Reset Code Sent!</h2>
                <p>
                  If an account exists with this email, you will receive a 
                  password reset code. You'll be redirected to enter the code in a moment.
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Loader2 className="animate-spin mr-2" />
                <span>Redirecting you to the next step...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#1A202C]">Forgot Password</h2>
                <p className="text-[#1A202C]/70 mt-2">
                  Enter your email and we'll send you a code to reset your password
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-[#ABF600] focus:ring-[#ABF600]"
                      placeholder="Enter your email"
                      required
                    />
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
                      Sending Reset Code...
                    </>
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>

                <div className="text-center mt-4">
                  <Link
                    href="/login"
                    className="text-sm text-[#1A202C]/70 hover:text-[#1A202C]"
                  >
                    Remember your password? Sign in
                  </Link>
                </div>
              </form>
            </>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have a reset code?{" "}
              <Link href="/login/reset-password/confirm" className="text-[#ABF600] hover:underline">
                Enter it here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}