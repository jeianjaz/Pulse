"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  UserX, ClipboardList, Filter, Users, 
  CheckCircle, XCircle, Clock, Shield, 
  User, LogOut, Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

function Admin() {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 156,
    activeUsers: 132,
    pendingConsultations: 24,
    completedConsultations: 87
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newPassword || !oldPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    
    if (newPassword === oldPassword) {
      setError("New password cannot be the same as the old password");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    
    try {
      setIsSubmitting(true);
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
        setError(errorData.error || "Failed to change password");
        return;
      }
  
      // Reset states and close modal
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setShowPasswordModal(false);
      setIsPasswordChanged(true);
      
      // Show success toast
      toast.success("Password changed successfully", {
        position: "bottom-right",
        duration: 3000
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all flex items-center gap-2">
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-xl shadow-md border-2 border-blue-100/30 hover:border-blue-200/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalUsers}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-1 bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">85% active in last 30 days</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-white to-green-50/30 p-6 rounded-xl shadow-md border-2 border-green-100/30 hover:border-green-200/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Users</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.activeUsers}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <User className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-1 bg-green-500 rounded-full" style={{ width: '84%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">84% of total users</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-white to-amber-50/30 p-6 rounded-xl shadow-md border-2 border-amber-100/30 hover:border-amber-200/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Consultations</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.pendingConsultations}</h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-1 bg-amber-500 rounded-full" style={{ width: '22%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">22% of total consultations</p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-white to-purple-50/30 p-6 rounded-xl shadow-md border-2 border-purple-100/30 hover:border-purple-200/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed Consultations</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.completedConsultations}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-1 bg-purple-500 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">78% of total consultations</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <UserX size={20} />
              User Management
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Link 
                href="/admin/users" 
                className="block p-4 rounded-lg bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <User size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Manage Users</h3>
                      <p className="text-sm text-gray-500">View, edit, delete user accounts</p>
                    </div>
                  </div>
                  <div className="text-blue-500">→</div>
                </div>
              </Link>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-white to-green-50 border border-green-100 hover:border-green-200 hover:shadow-md transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-green-100 p-2 rounded-lg mb-2">
                      <Shield size={18} className="text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-800">Active Users</h3>
                    <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-white to-red-50 border border-red-100 hover:border-red-200 hover:shadow-md transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-red-100 p-2 rounded-lg mb-2">
                      <XCircle size={18} className="text-red-600" />
                    </div>
                    <h3 className="font-medium text-gray-800">Deactivated</h3>
                    <p className="text-2xl font-bold text-red-600">{stats.totalUsers - stats.activeUsers}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Consultation Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ClipboardList size={20} />
              Consultation Management
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Link 
                href="/admin/consultations" 
                className="block p-4 rounded-lg bg-gradient-to-br from-white to-emerald-50 border border-emerald-100 hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <CheckCircle size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Manage Consultations</h3>
                      <p className="text-sm text-gray-500">Accept or deny consultation requests</p>
                    </div>
                  </div>
                  <div className="text-emerald-500">→</div>
                </div>
              </Link>
              
              <Link 
                href="/admin/logs" 
                className="block p-4 rounded-lg bg-gradient-to-br from-white to-amber-50 border border-amber-100 hover:border-amber-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Filter size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Consultation Logs</h3>
                      <p className="text-sm text-gray-500">Filter and view consultation history</p>
                    </div>
                  </div>
                  <div className="text-amber-500">→</div>
                </div>
              </Link>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-white to-amber-50 border border-amber-100 hover:border-amber-200 hover:shadow-md transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-amber-100 p-2 rounded-lg mb-2">
                      <Clock size={18} className="text-amber-600" />
                    </div>
                    <h3 className="font-medium text-gray-800">Pending</h3>
                    <p className="text-2xl font-bold text-amber-600">{stats.pendingConsultations}</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-white to-purple-50 border border-purple-100 hover:border-purple-200 hover:shadow-md transition-all">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-purple-100 p-2 rounded-lg mb-2">
                      <CheckCircle size={18} className="text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-800">Completed</h3>
                    <p className="text-2xl font-bold text-purple-600">{stats.completedConsultations}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Admin;
