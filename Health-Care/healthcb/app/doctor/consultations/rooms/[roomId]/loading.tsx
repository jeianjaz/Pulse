'use client';

export default function ConsultationRoomLoading() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video area skeleton */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl h-[500px] animate-pulse flex items-center justify-center">
          <div className="h-16 w-16 border-4 border-gray-600 border-t-gray-400 rounded-full animate-spin"></div>
        </div>
        
        {/* Chat area skeleton */}
        <div className="bg-white rounded-xl shadow-md h-[500px] p-4 animate-pulse flex flex-col">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
          
          <div className="flex-1 space-y-4 overflow-auto mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${i % 2 === 0 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="space-y-1">
                    <div className="h-3 w-48 bg-gray-100 rounded"></div>
                    <div className="h-3 w-40 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 mt-auto">
            <div className="flex-1 h-10 bg-gray-200 rounded"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Patient info skeleton */}
      <div className="bg-white rounded-xl shadow-md p-4 mt-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-100 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
          </div>
          
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-100 rounded"></div>
            <div className="h-4 w-full bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}