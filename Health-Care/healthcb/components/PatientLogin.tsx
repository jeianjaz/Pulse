"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, User, Lock, Loader2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import BackgroundElements from "@/components/BackgroundElements";
import { login } from "@/utils/auth";
import FloatingMedicalIcons from "./FloatingMedicalIcons";

function PatientLogin() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 

  const handleLogin = async (e: React.FormEvent) => { 
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    
    try {
        const response = await login({ username, password });
        localStorage.setItem('user_id', response.user_id);
        localStorage.setItem('first_name', response.first_name);
        localStorage.setItem('last_name', response.last_name);
        
        if (response && response.status === 'SUCCESS') {
            console.log('Login successful:', response);
            router.push('/patient');
        } else {
            setErrorMessage(response.message || 'Login failed');
        }
    } catch (error: any) {
        console.error('Login failed:', error);
        setErrorMessage(error.message || 'An error occurred during login');
    } finally {
        setIsLoading(false);
    }
}; 

  const handleReturnToDashboard = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Side Gradients */}
        <motion.div
          className="absolute left-0 top-0 h-full w-[40%] opacity-30"
          style={{
            background: 'linear-gradient(to right, #79CEED, transparent)',
          }}
          animate={{
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Wave Lines - Left Side */}
        <svg
          className="absolute left-0 top-0 h-full w-[400px] opacity-30"
          viewBox="0 0 400 800"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M-100,0 C150,100 150,300 -100,400 C150,500 150,700 -100,800"
            fill="none"
            stroke="#79CEED"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>

        {/* Floating Elements */}
        <motion.div
          className="absolute left-[15%] top-[20%] w-32 h-32 rounded-full bg-gradient-to-r from-[#79CEED] to-[#06AFEC] opacity-25"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.35, 0.25],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute left-[25%] top-[60%] w-40 h-40 rounded-full bg-gradient-to-r from-[#06AFEC] to-[#79CEED] opacity-25"
          animate={{
            y: [0, 30, 0],
            scale: [1.2, 1, 1.2],
            opacity: [0.25, 0.35, 0.25],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Stethoscope className="w-16 h-16 mx-auto text-accent-blue" />
            </motion.div>
            <h2 className="mt-4 text-3xl font-bold bg-gradient-secondary text-transparent bg-clip-text">
              Welcome to HealthCare
            </h2>
            <p className="mt-2 text-gray-600">Sign in to access your account</p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-700 font-semibold">Username</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-accent-blue">
                    <User className="h-5 w-5" />
                  </div>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-2 border-accent-blue/20 focus:border-accent-blue focus:ring-accent-blue bg-white text-black placeholder-gray-400"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-accent-blue">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-2 border-accent-blue/20 focus:border-accent-blue focus:ring-accent-blue bg-white text-black placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-[#06AFEC] hover:bg-[#0598CE] text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>

              <div className="text-center">
                <Link 
                  href="/login/reset-password/request" 
                  className="text-accent-blue hover:underline text-sm"
                >
                  Forgot password?
                </Link>
              </div>
              
              <Link href="/patient/register" passHref>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#06AFEC] text-[#06AFEC] hover:bg-[#06AFEC] hover:text-white"
                >
                  Create Account
                </Button>
              </Link>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleReturnToDashboard}
                className="px-4 py-1.5 bg-white border border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-white transition-all text-xs rounded-md"
              >
                Return to Dashboard
              </Button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right side with image */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-blue items-center justify-center">
        <div className="relative w-full h-screen">
          <Image
            src="/siabgpatient.png"
            alt="Healthcare Illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  ); 
} 

export default PatientLogin;