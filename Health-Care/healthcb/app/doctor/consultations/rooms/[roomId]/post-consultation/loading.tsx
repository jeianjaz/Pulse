'use client';

export default function PostConsultationLoading() {
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Consultation Overview */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-md p-4 mb-4 animate-pulse">
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
              </div>
              
              {/* Patient Info Section */}
              <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full mr-2"></div>
                    <div className="h-5 w-40 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="h-4 w-full bg-gray-100 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                </div>
              </div>
              
              {/* Appointment Details Section */}
              <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-purple-50 p-2 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full mr-2"></div>
                  <div className="h-5 w-36 bg-gray-200 rounded"></div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="h-4 w-full bg-gray-100 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                  <div className="h-4 w-4/5 bg-gray-100 rounded"></div>
                </div>
              </div>
              
              {/* Health Prediction Section */}
              <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-indigo-50 p-2 flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full mr-2"></div>
                  <div className="h-5 w-44 bg-gray-200 rounded"></div>
                </div>
                <div className="p-3 space-y-3">
                  <div className="h-4 w-full bg-gray-100 rounded"></div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Consultation Form */}
          <div className="lg:col-span-7">
            <div className="space-y-6 bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex justify-between items-center mb-2 pb-2 border-b">
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
              </div>
              
              {/* Diagnosis field */}
              <div className="space-y-2">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                <div className="h-28 bg-gray-100 rounded"></div>
                <div className="h-3 w-72 bg-gray-100 rounded"></div>
              </div>
              
              {/* Medications field */}
              <div className="space-y-2">
                <div className="h-5 w-48 bg-gray-200 rounded"></div>
                <div className="h-28 bg-gray-100 rounded"></div>
                <div className="h-3 w-80 bg-gray-100 rounded"></div>
              </div>
              
              {/* Treatment plan field */}
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
                <div className="h-28 bg-gray-100 rounded"></div>
                <div className="h-3 w-96 bg-gray-100 rounded"></div>
              </div>
              
              {/* Follow-up section */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mt-6">
                <div className="flex items-center mb-3">
                  <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
                  <div className="h-5 w-40 bg-gray-200 rounded"></div>
                </div>
                
                <div className="space-y-4 pl-7 border-l-2 border-blue-200 mt-2">
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                <div className="h-10 w-24 bg-gray-200 rounded-md mr-4"></div>
                <div className="h-10 w-48 bg-blue-200 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}