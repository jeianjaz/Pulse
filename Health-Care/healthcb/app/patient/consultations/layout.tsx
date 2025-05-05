'use client';

import { ArrowLeft, Calendar, Video, History, Home, ClipboardList } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import BackgroundElements from '@/components/BackgroundElements';
import Link from 'next/link';

export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <main className="min-h-screen bg-[#FFFFFF] relative overflow-hidden">
      <BackgroundElements />
      
      <div className="container mx-auto px-6 pt-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <ArrowLeft 
              className="w-8 h-8 text-[#1A202C] cursor-pointer hover:text-gray-700 transition-colors" 
              onClick={() => router.back()}
            />
            <h1 className="text-4xl font-dm-sans font-bold text-[#1A202C] ml-4">
              My Consultations
            </h1>
          </div>
          <Link 
            href="/patient"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b">
          <Link
            href="/patient/consultations"
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${
              isActive('/patient/consultations')
                ? 'bg-[#ABF600] text-[#1A202C] font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </Link>
          <Link
            href="/patient/consultations/requests"
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${
              isActive('/patient/consultations/requests')
                ? 'bg-[#ABF600] text-[#1A202C] font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>My Requests</span>
          </Link>
          <Link
            href="/patient/consultations/rooms"
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${
              isActive('/patient/consultations/rooms')
                ? 'bg-[#ABF600] text-[#1A202C] font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Rooms</span>
          </Link>
          <Link
            href="/patient/consultations/history"
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${
              isActive('/patient/consultations/history')
                ? 'bg-[#ABF600] text-[#1A202C] font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </Link>
        </div>

        {children}
      </div>
    </main>
  );
}