"use client";

const BackgroundElements = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Subtle Dots Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `radial-gradient(#22c55e 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Static Side Gradients */}
      <div
        className="absolute left-0 top-0 h-full w-[25%] opacity-5"
        style={{
          background: 'linear-gradient(to right, #22c55e, transparent)',
        }}
      />

      <div
        className="absolute right-0 top-0 h-full w-[25%] opacity-5"
        style={{
          background: 'linear-gradient(to left, #22c55e, transparent)',
        }}
      />
    </div>
  );
};

export default BackgroundElements;
