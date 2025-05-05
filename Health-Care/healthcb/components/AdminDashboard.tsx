// components/AdminDashboard.tsx
"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Users, FileText, Settings, LogOut } from "lucide-react";
import BackgroundElements from "./BackgroundElements";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setLoading(true);
    // Clear tokens and redirect to home page
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  const dashboardItems = [
    { icon: <Users className="w-8 h-8" />, title: "Manage Users", description: "Add, edit, or remove user accounts" },
    { icon: <FileText className="w-8 h-8" />, title: "Reports", description: "View and generate system reports" },
    { icon: <Settings className="w-8 h-8" />, title: "Settings", description: "Configure system settings" },
  ];

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <BackgroundElements />
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-dm-sans font-bold text-[#1A202C] mb-8">
          Admin Dashboard
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {dashboardItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#F3F3F3] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="mr-4 text-[#ABF600]">{item.icon}</div>
                <h3 className="text-xl font-dm-sans font-bold text-[#1A202C]">{item.title}</h3>
              </div>
              <p className="text-[#1A202C]/70 font-dm-sans">{item.description}</p>
            </motion.div>
          ))}
        </div>
        <motion.button
          onClick={handleLogout}
          className="w-full sm:w-auto bg-[#ABF600] text-[#1A202C] hover:bg-[#9DE100] font-dm-sans text-lg px-8 py-3 rounded-md transition-colors flex items-center justify-center"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            "Logging out..."
          ) : (
            <>
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </>
          )}
        </motion.button>
      </div>
    </main>
  );
}