import React from 'react';
import { Calendar } from 'lucide-react';

const DefaultEventImage = () => {
  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No image available</p>
      </div>
    </div>
  );
};

export default DefaultEventImage;
