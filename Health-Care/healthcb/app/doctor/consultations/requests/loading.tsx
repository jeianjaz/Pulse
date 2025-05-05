'use client';

export default function ConsultationRequestsLoading() {
  return (
    <div className="p-6">
      <div className="mb-8 animate-pulse">
        <div className="h-8 w-72 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-96 bg-gray-100 rounded"></div>
      </div>

      {/* Filter controls skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6 animate-pulse">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="h-10 w-48 bg-gray-200 rounded"></div>
          <div className="h-10 w-56 bg-gray-200 rounded"></div>
          <div className="ml-auto h-10 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-5">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                </th>
                <th className="px-8 py-5 text-left">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </th>
                <th className="px-8 py-5 text-left">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </th>
                <th className="px-8 py-5 text-left">
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                </th>
                <th className="px-8 py-5 text-left">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-5">
                    <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-2">
                      <div className="h-5 w-40 bg-gray-200 rounded"></div>
                      <div className="h-4 w-32 bg-gray-100 rounded"></div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-gray-200 rounded"></div>
                      <div className="h-4 w-24 bg-gray-100 rounded"></div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}