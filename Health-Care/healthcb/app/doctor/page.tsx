// app/admin/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FileText, Calendar, Activity, User, LogOut, BarChart2, Stethoscope } from "lucide-react";
import AdminLayout from "./layout";
import { useAuth } from "@/contexts/AuthContext";

function Admin() {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isForcePasswordChange, setIsForcePasswordChange] = useState(false);

  useEffect(() => {
    const checkDefaultPassword = async () => {
      const isDefault = localStorage.getItem("isDefaultPassword");
      if (isDefault === "true") {
        setShowEditPassword(true);
        setIsForcePasswordChange(true);
      }
    };
    checkDefaultPassword();
  }, []);

  const menuItems = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Medical Events",
      description: "View and manage ongoing medical caravan events and schedules.",
      href: "/doctor/medical-events",
      iconBg: "bg-[#FDF2F8]",
      iconColor: "text-[#EC4899]",
      containerBg: "bg-gradient-to-br from-white to-[#FDF2F8]/30",
      hoverBg: "hover:bg-[#FDF2F8]/40",
      borderStyle: "border-2 border-[#EC4899]/20 hover:border-[#EC4899]/30",
    },
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: "Consultations",
      description: "Manage consultation schedules and appointments.",
      href: "/doctor/consultations",
      iconBg: "bg-[#F0FDFA]",
      iconColor: "text-[#0D9488]",
      containerBg: "bg-gradient-to-br from-white to-[#F0FDFA]/30",
      hoverBg: "hover:bg-[#F0FDFA]/40",
      borderStyle: "border-2 border-[#0D9488]/20 hover:border-[#0D9488]/30",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Volunteers",
      description: "Manage and coordinate volunteer activities and schedules.",
      href: "/doctor/volunteers",
      iconBg: "bg-[#F3E8FF]",
      iconColor: "text-[#9333EA]",
      containerBg: "bg-gradient-to-br from-white to-[#F3E8FF]/30",
      hoverBg: "hover:bg-[#F3E8FF]/40",
      borderStyle: "border-2 border-[#9333EA]/20 hover:border-[#9333EA]/30",
    },
    {
      icon: <User className="w-6 h-6" />,
      title: "Manage Account",
      description: "Update your account settings",
      onClick: () => setShowEditPassword(true),
      iconBg: "bg-[#F0F7FF]",
      iconColor: "text-[#4A90E2]",
      containerBg: "bg-gradient-to-br from-white to-[#F0F7FF]/30",
      hoverBg: "hover:bg-[#F0F7FF]/40",
      borderStyle: "border-2 border-[#4A90E2]/20 hover:border-[#4A90E2]/30",
    },
  ];

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout(); // This will handle cookie clearing and redirection
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPassword = async (e: FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newPassword || !oldPassword || !confirmPassword) {
      alert("All fields are required.");
      return;
    }
    
    if (newPassword === oldPassword) {
      alert("New password cannot be the same as the old password!");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    
    try {
      const response = await fetch(`/api/auth/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          old_password: oldPassword, 
          new_password: newPassword,
          confirm_password: confirmPassword 
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to change password'}`);
        return;
      }
  
      const data = await response.json();
      alert("Password changed successfully!");
      
      if (isForcePasswordChange) {
        localStorage.setItem("isDefaultPassword", "false");
      }
      
      setShowEditPassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("An error occurred while changing your password. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      
      <div className="container mx-auto px-6 pt-8 relative z-10">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-dm-sans font-bold text-[#1A202C]">
            Admin Healthcare Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {menuItems.map((item, index) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={`${item.containerBg} backdrop-blur-sm p-6 rounded-xl shadow-sm ${item.hoverBg} ${item.borderStyle} transition-all duration-300 cursor-pointer`}
    onClick={() => item.href ? router.push(item.href) : item.onClick?.()}
  >
            
              <div className="flex items-center mb-4">
                <div className={`p-3 ${item.iconBg} rounded-lg mr-4 ${item.iconColor}`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-dm-sans font-bold text-[#2D3748]">
                  {item.title}
                </h3>
              </div>
              <p className="text-[#4A5568] font-dm-sans">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Monthly Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <h3 className="text-xl font-dm-sans font-bold text-[#2D3748] mb-4">Monthly Statistics</h3>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-4 rounded-lg border border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-[#4A5568] font-dm-sans">Total Patients</span>
                  <span className="font-bold text-[#2D3748]">248</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                  <div className="bg-[#4A90E2] h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-lg border border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-[#4A5568] font-dm-sans">Appointments</span>
                  <span className="font-bold text-[#2D3748]">156</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                  <div className="bg-[#10B981] h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-lg border border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-[#4A5568] font-dm-sans">New Registrations</span>
                  <span className="font-bold text-[#2D3748]">84</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                  <div className="bg-[#F59E0B] h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Yearly Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <h3 className="text-xl font-dm-sans font-bold text-[#2D3748] mb-4">Yearly Overview</h3>
            <div className="space-y-4">
              <div className="bg-[#F8FAFC] p-4 rounded-lg border border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-[#4A5568] font-dm-sans">Total Cases</span>
                  <span className="font-bold text-[#2D3748]">2,456</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                  <div className="bg-[#8B5CF6] h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-lg border border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-[#4A5568] font-dm-sans">Success Rate</span>
                  <span className="font-bold text-[#2D3748]">92%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                  <div className="bg-[#EC4899] h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-lg border border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-[#4A5568] font-dm-sans">Patient Satisfaction</span>
                  <span className="font-bold text-[#2D3748]">88%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                  <div className="bg-[#06B6D4] h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showEditPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
              >
                <h2 className="text-2xl font-dm-sans font-bold text-[#1A202C] mb-6">
                  {isForcePasswordChange ? "Change Default Password" : "Manage Account"}
                </h2>
                {isForcePasswordChange && (
                  <p className="text-red-500 mb-4">
                    You must change your default password before continuing.
                  </p>
                )}
                <form onSubmit={handleEditPassword}>
                  {/* Old Password Field */}
                  <div className="mb-4">
                    <label className="block text-[#1A202C] font-dm-sans mb-2">Old Password:</label>
                    <input
                      type="text"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-[#ABF600] focus:border-transparent outline-none text-[#1A202C] placeholder-gray-400 bg-white"
                      placeholder="Enter your current password"
                      required
                    />
                  </div>

                  {/* New Password Field */}
                  <div className="mb-4">
                    <label className="block text-[#1A202C] font-dm-sans mb-2">New Password:</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-[#ABF600] focus:border-transparent outline-none text-[#1A202C] placeholder-gray-400 bg-white"
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-6">
                    <label className="block text-[#1A202C] font-dm-sans mb-2">Confirm Password:</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-[#ABF600] focus:border-transparent outline-none text-[#1A202C] placeholder-gray-400 bg-white"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4">
                    {!isForcePasswordChange && (
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(false)}
                        className="px-4 py-2 text-[#1A202C] font-dm-sans hover:bg-gray-100 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#ABF600] text-[#1A202C] rounded font-dm-sans hover:bg-[#9DE100] transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default Admin;