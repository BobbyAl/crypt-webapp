"use client";

import { FaLock, FaKey, FaShieldAlt, FaFingerprint, FaUserSecret } from 'react-icons/fa';

export default function BackgroundIcons() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
      {/* Top left */}
      <div className="absolute -top-20 -left-20 text-white/[0.03] transform rotate-12 animate-float-slow">
        <FaLock className="w-80 h-80" />
      </div>
      
      {/* Top right */}
      <div className="absolute top-1/4 -right-20 text-white/[0.03] transform -rotate-12 animate-float-slow-reverse">
        <FaKey className="w-96 h-96" />
      </div>
      
      {/* Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/[0.03] animate-float">
        <FaShieldAlt className="w-[32rem] h-[32rem]" />
      </div>
      
      {/* Bottom left */}
      <div className="absolute bottom-1/4 -left-20 text-white/[0.03] transform rotate-45 animate-float-reverse">
        <FaFingerprint className="w-96 h-96" />
      </div>
      
      {/* Bottom right */}
      <div className="absolute -bottom-20 -right-20 text-white/[0.03] transform -rotate-12 animate-float">
        <FaUserSecret className="w-80 h-80" />
      </div>
    </div>
  );
} 