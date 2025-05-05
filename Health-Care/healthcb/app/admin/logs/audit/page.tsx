"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, Filter, ChevronDown, 
  Download, ArrowUpDown, FileText,
  Calendar, Clock, User, Server,
  AlertCircle, ChevronLeft, ChevronRight,
  Layers, Activity
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import auditLogApi, { AuditLogEntry, AuditLogsPaginatedResponse } from "@/services/auditLogApi";
import { toast } from "react-hot-toast";
import axios from "axios";

const actionTypeColors = {
  create: "bg-green-100 text-green-800",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  approve: "bg-emerald-100 text-emerald-700",
  reject: "bg-orange-100 text-orange-700",
  login: "bg-purple-100 text-purple-700",
  logout: "bg-gray-100 text-gray-700",
  other: "bg-yellow-100 text-yellow-700"
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUsername, setFilterUsername] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterContent, setFilterContent] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd")
  });
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Unique action types and content types for filters
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [usernames, setUsernames] = useState<string[]>([]);

  // Fetch filter options from API
  const fetchFilterOptions = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.start) params.append('start_date', dateRange.start);
      if (dateRange.end) params.append('end_date', dateRange.end);
      const query = params.toString() ? `?${params.toString()}` : '';

      const [actionsRes, contentsRes, usersRes] = await Promise.all([
        axios.get(`/api/audit-logs/action-types${query}`),
        axios.get(`/api/audit-logs/content-types${query}`),
        axios.get(`/api/audit-logs/usernames${query}`)
      ]);
      setActionTypes(Array.isArray(actionsRes.data.data) ? actionsRes.data.data : actionsRes.data.data?.data || []);
      setContentTypes(Array.isArray(contentsRes.data.data) ? contentsRes.data.data : contentsRes.data.data?.data || []);
      setUsernames(Array.isArray(usersRes.data.data) ? usersRes.data.data : usersRes.data.data?.data || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
      toast.error('Failed to load filter options');
    }
  };

  // Fetch filter options on mount and when date range changes
  useEffect(() => {
    fetchFilterOptions();
  }, [dateRange.start, dateRange.end]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // Convert date range to ISO string format for API
      const startDate = dateRange.start ? new Date(dateRange.start).toISOString() : undefined;
      const endDate = dateRange.end ? new Date(dateRange.end + 'T23:59:59').toISOString() : undefined;

      // Use searchTerm as username if filled, otherwise use filterUsername
      const usernameParam = searchTerm ? searchTerm : (filterUsername || undefined);

      const response = await auditLogApi.getAuditLogs({
        page,
        page_size: pageSize,
        start_date: startDate,
        end_date: endDate,
        username: usernameParam,
        action: filterAction || undefined,
        content: filterContent || undefined
        // search: undefined // Do not send search param
      });

      const paginatedResponse = response as AuditLogsPaginatedResponse;
      setLogs(paginatedResponse.results);
      setTotalCount(paginatedResponse.count);
      setTotalPages(Math.ceil(paginatedResponse.count / pageSize));
      setHasNextPage(!!paginatedResponse.next);
      setHasPrevPage(!!paginatedResponse.previous);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAuditLogs();
  }, [page, pageSize]);

  // Handle search and filter
  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchAuditLogs();
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Export logs (placeholder functionality)
  const handleExportLogs = () => {
    toast.success("Logs would be exported as CSV in a real implementation");
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, "yyyy-MM-dd HH:mm:ss");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Audit Logs</h1>
          <div className="flex space-x-2 mt-2">
            <Link href="/admin/logs/consultations" className="text-sm text-gray-600 hover:text-gray-800">
              Consultation Logs
            </Link>
            <span className="text-sm text-gray-400">/</span>
            <Link href="/admin/logs/audit" className="text-sm text-blue-600 font-medium hover:text-blue-700">
              Audit Logs
            </Link>
          </div>
        </div>
        <button 
          onClick={handleExportLogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Download size={18} />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by username"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <select
              className="appearance-none pl-4 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={filterUsername}
              onChange={(e) => setFilterUsername(e.target.value)}
            >
              <option value="">All Users</option>
              {usernames.map(username => (
                <option key={username} value={username}>{username}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="relative">
            <select
              className="appearance-none pl-4 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>{action.charAt(0).toUpperCase() + action.slice(1)}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="relative">
            <select
              className="appearance-none pl-4 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={filterContent}
              onChange={(e) => setFilterContent(e.target.value)}
            >
              <option value="">All Content Types</option>
              {contentTypes.map(content => (
                <option key={content} value={content}>{content}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Filter size={18} />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
      >
        {loading ? (
          <div className="p-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-gray-500">Loading audit logs...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("timestamp")}
                    >
                      <div className="flex items-center">
                        <span>Timestamp</span>
                        {sortField === "timestamp" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("username")}
                    >
                      <div className="flex items-center">
                        <span>User</span>
                        {sortField === "username" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("action_type")}
                    >
                      <div className="flex items-center">
                        <span>Action</span>
                        {sortField === "action_type" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("content_type")}
                    >
                      <div className="flex items-center">
                        <span>Content Type</span>
                        {sortField === "content_type" && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "asc" ? "transform rotate-180" : ""}`} />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatTimestamp(log.timestamp)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{log.user_display}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            actionTypeColors[log.action_type as keyof typeof actionTypeColors] || "bg-gray-100 text-gray-800"
                          }`}>
                            {log.action_type.charAt(0).toUpperCase() + log.action_type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.content_type}</div>
                          <div className="text-sm text-gray-500">ID: {log.object_id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 line-clamp-2">{log.object_repr}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedLog(log);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none"
                            aria-label="View details"
                          >
                            <FileText className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-700">No audit logs found</h3>
                          <p className="text-gray-500 mt-1">Try adjusting your filters or search term</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!hasPrevPage}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${!hasPrevPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasNextPage}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${!hasNextPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{logs.length ? (page - 1) * pageSize + 1 : 0}</span> to <span className="font-medium">{Math.min(page * pageSize, totalCount)}</span> of{' '}
                    <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!hasPrevPage}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${!hasPrevPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show 2 pages before and after current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            page === pageNum ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!hasNextPage}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${!hasNextPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Audit Log Details</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                actionTypeColors[selectedLog.action_type as keyof typeof actionTypeColors] || "bg-gray-100 text-gray-800"
              }`}>
                {selectedLog.action_type.charAt(0).toUpperCase() + selectedLog.action_type.slice(1)}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Timestamp</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-blue-600" />
                        {formatTimestamp(selectedLog.timestamp)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">IP Address</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <Server className="h-4 w-4 mr-1 text-blue-600" />
                        {selectedLog.ip_address}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Object ID & Type</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <Layers className="h-4 w-4 mr-1 text-blue-600" />
                        {selectedLog.content_type} (ID: {selectedLog.object_id})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">User Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedLog.user_display}</p>
                      <p className="text-sm text-gray-500">User ID: {selectedLog.user}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-900">{selectedLog.object_repr}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Action Data</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="overflow-x-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.action_data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">User Agent</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 break-words">{selectedLog.user_agent}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={handleExportLogs}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                <span>Export This Log</span>
              </button>
              
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLog(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}