"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";

function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [stateError, setStateError] = useState("");
  const { login, isLoading, error: authError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStateError("");
    try {
      await login(id, password);
      
      const userType = determineUserType(id);
      
      switch(userType) {
        case "patient":
          router.push('/patient/consultations');
          break;
        case "doctor":
          router.push('/doctor/consultations');
          break;
        case "admin":
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/');
      }
    } catch (error: any) {
      setStateError(error.message || "Login failed");
    }
  };
  
  // Helper function to determine user type from ID format if needed
  const determineUserType = (id: string): string => {
    // This is a placeholder implementation
    // You should replace this with your actual logic to determine user type from ID
    if (id.startsWith('P')) return 'patient';
    if (id.startsWith('D')) return 'doctor';
    if (id.startsWith('A')) return 'admin';
    return 'patient'; // Default fallback
  };
  
  const displayError = stateError || authError || urlError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-emerald-50">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-1/3 opacity-20"
          style={{
            background: 'linear-gradient(to right, #10b981, transparent)',
          }}
        />
        <div className="absolute right-0 bottom-0 h-full w-1/3 opacity-20"
          style={{
            background: 'linear-gradient(to left, #10b981, transparent)',
          }}
        />
      </div>
      
      <Link href="/" className="absolute top-6 left-6 z-20">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 border-emerald-200 text-emerald-700 hover:text-emerald-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </Button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg z-10 mx-4"
      >
        <div className="text-center">
          <Image 
            src="/images/pulse/pulsename.png" 
            alt="Pulse Healthcare Logo" 
            width={180} 
            height={56} 
            className="mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Pulse
          </h2>
          <p className="text-gray-600">Please sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {displayError && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {displayError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="id" className="text-gray-700">
                User ID
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  id="id"
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 bg-white text-black placeholder-gray-500 shadow-sm"
                  placeholder="Enter your ID"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 bg-white text-black placeholder-gray-500 shadow-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full transition-all ${
              isLoading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-emerald-600 hover:bg-emerald-700"
            } text-white py-2 rounded-md`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center text-sm">
            <Link 
              href="/login/reset-password/request" 
              className="text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Forgot password?
            </Link>
            <div className="mt-2">
              <Link 
                href="/patient/register" 
                className="text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Don't have an account? Register here
              </Link>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;