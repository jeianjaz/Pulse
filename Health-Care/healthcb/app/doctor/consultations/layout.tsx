'use client';

import BackgroundElements from '@/components/BackgroundElements';

export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#FFFFFF] relative overflow-hidden">
      <BackgroundElements />
      
      <div className="container mx-auto px-6 pt-8 relative z-10">
        {children}
      </div>
    </main>
  );
}