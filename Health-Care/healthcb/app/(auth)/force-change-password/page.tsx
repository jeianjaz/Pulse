// pages/force-change-password.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import BackgroundElements from "@/components/BackgroundElements";

export default function ForceChangePassword() {
  const router = useRouter();
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Get default password on component mount
  useEffect(() => {
    const defaultPwd = localStorage.getItem("defaultPassword");
    if (defaultPwd) {
      setPasswordForm(prev => ({
        ...prev,
        oldPassword: defaultPwd
      }));
      // Clear stored default password for security
      localStorage.removeItem("defaultPassword");
    }
  }, []);

  const [passwordError, setPasswordError] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*#?&]/.test(password);
    const isLongEnough = password.length >= 8;

    return (
      hasUpperCase && 
      hasLowerCase && 
      hasNumber && 
      hasSpecial && 
      isLongEnough
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Validation checks
    if (!validatePassword(passwordForm.newPassword)) {
      setPasswordError("Password must contain at least 8 characters, including uppercase, lowercase, number and special character");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword === passwordForm.oldPassword) {
      setPasswordError("New password cannot be same as old password");
      return;
    }

    try {
      // Use the new API endpoint
      const response = await fetch("/api/auth/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          old_password: passwordForm.oldPassword,
          new_password: passwordForm.newPassword,
          confirm_password: passwordForm.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem("defaultPassword"); // Cleanup
        localStorage.setItem("isDefaultPassword", "false");
        
        // Determine where to redirect based on user type (from localStorage or other source)
        const userType = localStorage.getItem("userType");
        if (userType === "doctor") {
          router.push("/doctor");
        } else if (userType === "admin") {
          router.push("/admin");
        } else {
          router.push("/patient");  // Default to patient
        }
      } else {
        setPasswordError(data.error || "Failed to change password");
      }
    } catch (error) {
      setPasswordError("An error occurred. Please try again");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <BackgroundElements />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-8">
            Change Default Password
          </h1>
          
          {passwordError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
              
              {/* Password Input Fields */}
              {[
                { label: "Current Password", key: "oldPassword" as const, show: "old" as const },
                { label: "New Password", key: "newPassword" as const, show: "new" as const },
                { label: "Confirm Password", key: "confirmPassword" as const, show: "confirm" as const }
              ].map((field) => (
                <div key={field.key}>
                  <label className="font-semibold text-gray-700">{field.label}</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                      type={showPasswords[field.show] ? "text" : "password"}
                      value={passwordForm[field.key]}
                      onChange={(e) => setPasswordForm({
                        ...passwordForm,
                        [field.key]: e.target.value
                      })}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 
                        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ABF600] focus:border-transparent
                        hover:border-gray-400 transition-colors"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({
                        ...showPasswords,
                        [field.show]: !showPasswords[field.show]
                      })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords[field.show] ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-[#ABF600] text-black py-2 rounded-lg hover:bg-[#9DE100] transition-colors"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}