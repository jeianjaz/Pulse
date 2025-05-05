"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';

interface NavButtonProps {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
  exact?: boolean; // New prop to control exact matching
}

const NavButton = ({
  href,
  children,
  icon,
  className = "",
  activeClassName = "",
  onClick,
  exact = false, // Default to false for backward compatibility
}: NavButtonProps) => {
  const pathname = usePathname();
  
  // Enhanced active route check with exact option
  const isActive = exact 
    ? pathname === href // Exact match only
    : pathname === href || // Exact match
      (href !== '/' && // Not home route
       pathname.startsWith(href) && // Starts with the href
       (pathname.length === href.length || // Same length
        pathname.charAt(href.length) === '/')); // Or next char is a path separator
  
  return (
    <Link 
      href={href}
      className={`${className} ${isActive ? activeClassName : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        {icon && <span className={isActive ? "text-emerald-600" : "text-gray-500"}>{icon}</span>}
        <span>{children}</span>
      </div>
    </Link>
  );
};

export default NavButton;