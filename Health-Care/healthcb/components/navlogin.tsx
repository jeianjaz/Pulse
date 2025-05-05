"use client"

import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="absolute top-4 right-8 z-10 flex justify-between items-center">
      <div className="flex space-x-4">
        <Link 
          href="/" 
          className="bg-gradient-secondary text-white font-semibold rounded-md px-4 py-2 hover:opacity-90 transition-all shadow-md hover:shadow-lg"
        >
          Home
        </Link>
        <Link 
          href="/about" 
          className="bg-white/80 backdrop-blur-sm text-accent-blue font-semibold rounded-md px-4 py-2 hover:bg-white transition-all border border-accent-blue shadow-md hover:shadow-lg"
        >
          About Us
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
