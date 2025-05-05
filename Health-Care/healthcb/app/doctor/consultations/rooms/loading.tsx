'use client';

export default function ConsultationRoomsLoading() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center gap-3">
          <div className="h-5 w-36 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-9 w-32 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Filter skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6 animate-pulse">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-10 w-40 bg-gray-200 rounded"></div>
          <div className="h-10 w-48 bg-gray-200 rounded"></div>
          <div className="ml-auto h-10 w-36 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      {/* Appointments skeleton */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-40 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 w-12 bg-gray-200 rounded"></div>
            </div>
            
            <div className="mt-4 space-y-4">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <div className="h-5 w-56 bg-gray-200 rounded"></div>
                      <div className="h-4 w-32 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-8 w-28 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 rounded"></div>
                    <div className="h-4 w-4/5 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}