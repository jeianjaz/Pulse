"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, Calendar, Video, Users, FileText, 
  Heart, Activity, LogOut, Menu, X,
  UserX, ClipboardList, Filter, User
} from 'lucide-react';
import Image from 'next/image';
import NavButton from './NavButton';

interface SidebarProps {
  userType: 'patient' | 'doctor' | 'admin';
  onLogout: () => void;
}

export default function DashboardSidebar({ userType, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Helper to expand parent if any subitem matches
  const shouldExpandParent = (subItems) => {
    if (!subItems) return false;
    return subItems.some(item => 
      pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')
    );
  };

  const patientLinks = [
    { name: 'Dashboard', href: '/patient', icon: <Home className="w-5 h-5" />, exact: true },
    { name: 'Consultations', href: '/patient/consultations', icon: <Video className="w-5 h-5" /> },
    { name: 'Medical Events', href: '/patient/events', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Health Records', href: '/patient/records', icon: <FileText className="w-5 h-5" /> },
    { name: 'Volunteer', href: '/patient/volunteer', icon: <Heart className="w-5 h-5" /> },
    { name: 'Manage Profile', href: '/patient/manage-profile', icon: <User className="w-5 h-5" /> },
  ];

  const doctorLinks = [
    { name: 'Dashboard', href: '/doctor', icon: <Home className="w-5 h-5" />, exact: true },
    { 
      name: 'Consultations', 
      href: '/doctor/consultations', 
      icon: <Video className="w-5 h-5" />,
      exact: false, // Will be active for all child routes
      subItems: [
        { name: 'Schedule', href: '/doctor/consultations', icon: <Calendar className="w-4 h-4" />, exact: true },
        { name: 'Requests', href: '/doctor/consultations/requests', icon: <ClipboardList className="w-4 h-4" />, exact: true },
        { name: 'Rooms', href: '/doctor/consultations/rooms', icon: <Video className="w-4 h-4" />, exact: true },
      ]
    },
    { name: 'Medical Events', href: '/doctor/medical-events', icon: <Calendar className="w-5 h-5" />, exact: false },
    { name: 'Inventory', href: '/doctor/inventory', icon: <Activity className="w-5 h-5" />, exact: false },
    { name: 'Volunteers', href: '/doctor/volunteers', icon: <Users className="w-5 h-5" />, exact: false },
    { name: 'Manage Profile', href: '/doctor/manage-profile', icon: <User className="w-5 h-5" />, exact: false },
  ];

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: <Home className="w-5 h-5" />, exact: true },
    { name: 'Manage Users', href: '/admin/users', icon: <UserX className="w-5 h-5" /> },
    { name: 'Consultations', href: '/admin/consultations', icon: <ClipboardList className="w-5 h-5" /> },
    { 
      name: 'System Logs', 
      href: '/admin/logs', 
      icon: <Filter className="w-5 h-5" />,
      subItems: [
        { name: 'Consultation Logs', href: '/admin/logs', icon: <ClipboardList className="w-4 h-4" />, exact: true },
        { name: 'Audit Logs', href: '/admin/logs/audit', icon: <Activity className="w-4 h-4" />, exact: true },
      ]
    },
  ];

  let links;
  if (userType === 'patient') {
    links = patientLinks;
  } else if (userType === 'doctor') {
    links = doctorLinks;
  } else {
    links = adminLinks;
  }

  links.forEach(link => {
    if (link.subItems && shouldExpandParent(link.subItems) && !expandedItems[link.name]) {
      expandedItems[link.name] = true;
    }
  });

  const toggleMobileMenu = () => setIsMobileMenuOpen(v => !v);

  const getAvatar = () => {
    if (userType === 'patient') return "/images/pulse/Open Peeps - Avatar (1).png";
    if (userType === 'doctor') return "/images/pulse/Open Peeps - Avatar (2).png";
    return "/images/pulse/Open Peeps - Avatar (3).png";
  };
  const getPortalLabel = () => {
    if (userType === 'patient') return "Patient Portal";
    if (userType === 'doctor') return "Doctor Portal";
    return "Admin Portal";
  };
  const getPortalDesc = () => {
    if (userType === 'patient') return "Manage your health";
    if (userType === 'doctor') return "Manage your patients";
    return "System Administration";
  };

  const renderNav = (isMobile = false) => (
    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
      {links.map(link => {
        const hasSubItems = !!link.subItems;
        return (
          <div key={link.name} className="relative">
            <div className="relative">
              {hasSubItems ? (
                <div
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    expandedItems[link.name] 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                  onClick={() => toggleExpand(link.name)}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`transition-colors duration-300 ${expandedItems[link.name] ? 'text-emerald-600' : 'text-gray-500'}`}>
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </div>
                  <button className="text-gray-500">
                    {expandedItems[link.name] ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <NavButton
                  href={link.href}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-all relative text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                  activeClassName="bg-emerald-100 text-emerald-700 font-medium shadow-sm"
                  icon={link.icon}
                  exact={link.exact}
                  {...(isMobile ? { onClick: toggleMobileMenu } : {})}
                >
                  {link.name}
                </NavButton>
              )}
            </div>
            {hasSubItems && expandedItems[link.name] && (
              <div className="pl-8 space-y-1 mt-1">
                {link.subItems.map(subItem => (
                  <div key={subItem.name} className="relative">
                    <NavButton
                      href={subItem.href}
                      className="flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all relative text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      activeClassName="bg-emerald-100 text-emerald-700 font-medium shadow-sm"
                      icon={subItem.icon}
                      exact={subItem.exact}
                      {...(isMobile ? { onClick: toggleMobileMenu } : {})}
                    >
                      {subItem.name}
                    </NavButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  // Sidebar header rendering
  const renderHeader = () => (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-center mb-6 mt-2">
        <Image 
          src="/images/pulse/pulsename.png" 
          alt="Pulse Healthcare" 
          width={200} 
          height={60} 
          className="h-14 w-auto hover:scale-105 transition-transform duration-300 shadow-sm" 
        />
      </div>
      <div className="bg-emerald-50 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
        <div className="w-24 h-24 mx-auto mb-3 overflow-hidden transform hover:scale-105 transition-all duration-300">
          <Image 
            src={getAvatar()}
            alt={getPortalLabel()}
            width={100}
            height={100}
            className="rounded-full border-3 border-emerald-300 shadow-md hover:border-emerald-400 transition-all duration-300"
          />
        </div>
        <h3 className="font-medium text-gray-900">{getPortalLabel()}</h3>
        <p className="text-sm text-gray-500 mt-1">{getPortalDesc()}</p>
      </div>
    </div>
  );

  // Sidebar logout rendering
  const renderLogout = (isMobile = false) => (
    <div className="p-4 border-t border-gray-200">
      <button
        onClick={() => {
          if (isMobile) toggleMobileMenu();
          onLogout();
        }}
        className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="p-3 rounded-full bg-white shadow-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 border border-emerald-100"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 shadow-lg rounded-r-xl overflow-hidden">
        <div className="flex flex-col h-full">
          {renderHeader()}
          {renderNav(false)}
          {renderLogout(false)}
        </div>
      </div>

      {/* Sidebar - Mobile */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 lg:hidden"
        >
          <div className="fixed inset-0 bg-black/60" onClick={toggleMobileMenu}></div>
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-xl flex flex-col rounded-r-2xl">
            {renderHeader()}
            {renderNav(true)}
            {renderLogout(true)}
          </div>
        </motion.div>
      )}
    </>
  );
}
