"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle, XCircle, Clock, Calendar, 
  Search, Filter, ChevronDown, User, 
  Stethoscope, MessageCircle, Eye, 
  Download, ArrowUpDown, FileText
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data for consultation logs
type ConsultationLog = {
  id: number;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: string;
  reason: string;
  notes: string;
  duration: string;
};

const mockLogs: ConsultationLog[] = [
  // ...existing code...
];

export default function ConsultationLogs() {
  const [logs, setLogs] = useState<ConsultationLog[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedLog, setSelectedLog] = useState<ConsultationLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [dateRange, setDateRange] = useState({
    start: "2025-03-01",
    end: "2025-04-30"
  });

  // Get unique doctors, specialties, and statuses for filters
  const doctors: string[] = Array.from(new Set(logs.map((c: ConsultationLog) => c.doctorName)));
  const specialties: string[] = Array.from(new Set(logs.map((c: ConsultationLog) => c.doctorSpecialty)));
  const statuses: string[] = Array.from(new Set(logs.map((c: ConsultationLog) => c.status)));

  // Filter logs based on search and filters
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDoctor = filterDoctor === "All" || log.doctorName === filterDoctor;
    const matchesStatus = filterStatus === "All" || log.status === filterStatus;
    const matchesDateRange = new Date(log.date) >= new Date(dateRange.start) && 
                            new Date(log.date) <= new Date(dateRange.end);
    
    return matchesSearch && matchesDoctor && matchesStatus && matchesDateRange;
  });

  // Sort logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortField === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "patientName") {
      return sortDirection === "asc" 
        ? a.patientName.localeCompare(b.patientName) 
        : b.patientName.localeCompare(a.patientName);
    } else if (sortField === "doctorName") {
      return sortDirection === "asc" 
        ? a.doctorName.localeCompare(b.doctorName) 
        : b.doctorName.localeCompare(a.doctorName);
    } else {
      return 0;
    }
  });

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Export logs (mock functionality)
  const handleExportLogs = () => {
    alert("Logs would be exported as CSV or PDF in a real implementation");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Consultation Logs</h1>
          <div className="flex space-x-2 mt-2">
            <Link href="/admin/logs" className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
              Consultation Logs
            </Link>
            <span className="text-sm text-gray-400">/</span>
            <Link href="/admin/logs/audit" className="text-sm text-gray-600 hover:text-gray-800">
              Audit Logs
            </Link>
          </div>
        </div>
        <button 
          onClick={handleExportLogs}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <Download size={18} />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        {/* ...existing code... */}
      </div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
      >
        {/* ...existing code... */}
      </motion.div>

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* ...existing code... */}
        </div>
      )}
    </div>
  );
}